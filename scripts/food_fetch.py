import requests
import json
import os
import time

# --- 全局配置 ---
API_KEY = "51748fcded78fea766cab13ec90fcb56"
URL = "https://restapi.amap.com/v3/place/around"

# 边界框配置 (观山湖、云岩、南明)
MIN_LNG, MAX_LNG = 106.52, 106.79
MIN_LAT, MAX_LAT = 26.50, 26.69
STEP = 0.02 # 网格步长

TARGET_TYPES = ["050100", "050300", "050400", "050800", "050900", "050000"]

# 文件路径配置
DATA_DIR = './src/assets/data'
FINAL_FILE = os.path.join(DATA_DIR, 'guiyang_food_massive.json')
PROGRESS_FILE = os.path.join(DATA_DIR, 'scrape_progress.json') # 断点记录

def load_progress():
    """加载已完成的任务和已有数据"""
    if os.path.exists(PROGRESS_FILE) and os.path.exists(FINAL_FILE):
        try:
            with open(PROGRESS_FILE, 'r', encoding='utf-8') as f:
                completed_tasks = set(json.load(f))
            with open(FINAL_FILE, 'r', encoding='utf-8') as f:
                data = json.load(f)
                all_pois = {f"{item['name']}_{item['lng']}_{item['lat']}": item for item in data}
            print(f"📂 断点续传：已加载 {len(all_pois)} 条数据，跳过 {len(completed_tasks)} 个已完成任务。")
            return completed_tasks, all_pois
        except Exception as e:
            print(f"⚠️ 进度文件读取失败: {e}，将重新开始。")
    return set(), {}

def save_data(all_pois, completed_tasks):
    """保存当前数据和进度到磁盘"""
    os.makedirs(DATA_DIR, exist_ok=True)

    # 保存数据
    final_list = list(all_pois.values())
    final_list.sort(key=lambda x: x['rating'], reverse=True)
    with open(FINAL_FILE, 'w', encoding='utf-8') as f:
        json.dump(final_list, f, ensure_ascii=False, indent=2)

    # 保存进度
    with open(PROGRESS_FILE, 'w', encoding='utf-8') as f:
        json.dump(list(completed_tasks), f, ensure_ascii=False)

def fetch_with_retry(params, max_retries=3):
    """带重试机制的网络请求"""
    for attempt in range(max_retries):
        try:
            res = requests.get(URL, params=params, timeout=10)
            data = res.json()

            # 高德 QPS 限制或配额限制
            if data.get('infocode') == '10044' or data.get('infocode') == '10008':
                print(f"⚠️ 触发高德限制 (Code: {data.get('infocode')})，等待 5 秒后重试...")
                time.sleep(5)
                continue

            return data

        except requests.exceptions.RequestException as e:
            wait_time = (attempt + 1) * 2 # 指数退避: 2s, 4s, 6s
            print(f"🔄 网络异常 ({e}). 正在进行第 {attempt + 1}/{max_retries} 次重试，等待 {wait_time}s...")
            time.sleep(wait_time)

    return None # 重试全部失败

def main():
    # 1. 初始化网格
    centers = []
    curr_lng = MIN_LNG
    while curr_lng <= MAX_LNG:
        curr_lat = MIN_LAT
        while curr_lat <= MAX_LAT:
            centers.append((round(curr_lng, 4), round(curr_lat, 4)))
            curr_lat += STEP
        curr_lng += STEP

    # 2. 加载断点
    completed_tasks, all_pois = load_progress()
    total_tasks = len(centers) * len(TARGET_TYPES)

    print(f"🚀 启动爬虫任务！共 {total_tasks} 个抓取单元。")

    tasks_since_last_save = 0

    # 3. 开始执行
    for c_lng, c_lat in centers:
        for t_type in TARGET_TYPES:
            task_id = f"{c_lng}_{c_lat}_{t_type}"

            if task_id in completed_tasks:
                continue # 已抓取过，直接跳过

            print(f"📡 抓取任务: 区块({c_lng}, {c_lat}) - 分类({t_type})...")

            for page in range(1, 8):
                params = {
                    "key": API_KEY,
                    "location": f"{c_lng},{c_lat}",
                    "types": t_type,
                    "radius": 2500,
                    "offset": 25,
                    "page": page,
                    "extensions": "all"
                }

                # 使用封装的重试请求函数
                data = fetch_with_retry(params)

                # 严格的 QPS 限制控制 (高德要求不超过3次/秒，这里设为0.4秒一次保平安)
                time.sleep(0.4)

                if not data:
                    print(f"❌ 任务 {task_id} 页码 {page} 彻底失败，跳过。")
                    break # 这一页彻底失败，跳出页码循环

                if data.get('status') == '1' and data.get('pois'):
                    for poi in data['pois']:
                        lng, lat = map(float, poi['location'].split(','))

                        # 剔除离群点
                        if not (MIN_LNG - 0.05 <= lng <= MAX_LNG + 0.05 and MIN_LAT - 0.05 <= lat <= MAX_LAT + 0.05):
                            continue

                        unique_key = f"{poi['name']}_{lng}_{lat}"
                        if unique_key not in all_pois:
                            biz = poi.get('biz_ext', {})
                            rating = biz.get('rating')
                            cost = biz.get('cost')

                            all_pois[unique_key] = {
                                "name": poi['name'],
                                "type": poi.get('type', '').split(';')[-1],
                                "lng": lng,
                                "lat": lat,
                                "rating": float(rating) if (rating and not isinstance(rating, list)) else 4.0,
                                "cost": float(cost) if (cost and not isinstance(cost, list)) else 35.0,
                                "address": poi.get('address', '')
                            }
                else:
                    break # 没有数据了，跳出当前类型的页码循环

            # 当前任务 (一个坐标+一个分类的所有页) 彻底完成
            completed_tasks.add(task_id)
            tasks_since_last_save += 1

            # 每完成 10 个子任务，落盘保存一次，防止意外崩溃导致大面积数据丢失
            if tasks_since_last_save >= 10:
                save_data(all_pois, completed_tasks)
                print(f"💾 自动存档完成！当前总数据量: {len(all_pois)} 条。")
                tasks_since_last_save = 0

    # 4. 任务全部结束，进行最后一次保存
    save_data(all_pois, completed_tasks)
    print(f"\n✅ 爬虫任务全部结束！最终入库: {len(all_pois)} 条完美去重数据。")

if __name__ == "__main__":
    main()