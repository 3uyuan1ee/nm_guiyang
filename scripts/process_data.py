#!/usr/bin/env python3
"""
贵阳美食数据处理脚本
从 guiyang_food_full.json 生成完整的可视化数据
"""

import json
import uuid
import random

# 配置
INPUT_FILE = 'src/assets/data/guiyang_food_full.json'
OUTPUT_FILE = 'src/assets/data/guiyang_food_data_enhanced.json'

# 类别映射
CATEGORY_MAP = {
    '火锅': '火锅',
    '火锅店': '火锅',
    '咖啡馆': '咖啡',
    '咖啡厅': '咖啡',
    '烧烤': '烧烤夜市',
    '夜市': '烧烤夜市',
    '甜品店': '甜品糕点',
    '糕饼店': '甜品糕点',
    '快餐厅': '快餐',
    '麦当劳': '快餐',
    '肯德基': '快餐',
    '休闲餐饮场所': '饮品',
    '冷饮店': '饮品',
    '茶艺馆': '饮品',
    '特色餐饮': '特色餐饮',
    '特色/地方风味餐厅': '特色餐饮',
    '西餐厅(综合风味)': '异国料理',
    '日本料理': '异国料理',
    '外国餐厅': '异国料理',
    '餐饮相关': '家常菜',
    '海鲜酒楼': '家常菜',
    '综合酒楼': '家常菜',
    '专营店': '家常菜',
    '中餐厅': '中餐厅',
    '云贵菜': '地方菜系',
    '四川菜(川菜)': '地方菜系',
    '湖南菜(湘菜)': '地方菜系',
    '广东菜(粤菜)': '地方菜系',
    '东北菜': '地方菜系',
    '清真菜馆': '清真菜馆',
}

# 非餐饮类型（过滤）
NON_FOOD_TYPES = {
    '购物相关场所', '汽车维修', '服装鞋帽皮具店', '便民商店/便利店'
}

# 营业时间配置（半小时波动）
def get_opening_hours(category, index):
    """根据类别和索引生成营业时间"""
    base_hours = {
        "中餐厅": ("10:00", "22:00"),
        "家常菜": ("10:00", "22:00"),
        "地方菜系": ("10:00", "22:00"),
        "火锅": ("16:00", "03:00"),
        "烧烤夜市": ("16:00", "03:00"),
        "酒吧": ("18:00", "04:00"),
        "咖啡": ("08:00", "01:00"),
        "饮品": ("08:00", "01:00"),
        "特色餐饮": ("11:00", "21:00"),
        "异国料理": ("11:00", "21:00"),
        "甜品糕点": ("09:00", "22:00"),
        "快餐": ("09:00", "22:00"),
        "清真菜馆": ("10:00", "21:00")
    }

    if category not in base_hours:
        return ("10:00", "21:00")

    open_time, close_time = base_hours[category]
    open_h, open_m = map(int, open_time.split(":"))
    close_h, close_m = map(int, close_time.split(":"))

    # 添加随机波动（-2到+2个半小时）
    open_offset = (index % 5 - 2) * 30
    close_offset = ((index + 3) % 5 - 2) * 30

    open_total = open_h * 60 + open_m + open_offset
    close_total = close_h * 60 + close_m + close_offset

    # 处理跨天
    if close_total < 0:
        close_total += 24 * 60

    def to_time(t):
        t = t % (24 * 60)
        h = t // 60
        m = t % 60
        return f"{h:02d}:{m:02d}"

    return (to_time(open_total), to_time(close_total))

# 计算热度值（基于评分）
def calculate_heat_index(rating):
    """根据评分计算热度值，范围 80-96"""
    if not rating:
        return 84  # 默认值
    # rating 4.0-5.0 映射到 80-96
    min_rating, max_rating = 4.0, 5.0
    min_heat, max_heat = 80, 96
    if rating < min_rating:
        rating = min_rating
    if rating > max_rating:
        rating = max_rating
    return int((rating - min_rating) / (max_rating - min_rating) * (max_heat - min_heat) + min_heat)

# 读取数据
with open(INPUT_FILE, 'r', encoding='utf-8') as f:
    raw_data = json.load(f)

# 处理数据
processed_data = []
index = 0

for item in raw_data:
    # 过滤非餐饮类型
    if item.get('type') in NON_FOOD_TYPES:
        continue

    # 映射类别
    original_type = item.get('type', '')
    category = CATEGORY_MAP.get(original_type, original_type)

    # 如果映射后仍在非餐饮类型，跳过
    if category in NON_FOOD_TYPES:
        continue

    # 生成记录
    record = {
        'id': str(uuid.uuid4()),
        'name': item.get('name', ''),
        'category': category,
        'longitude': item.get('lng'),
        'latitude': item.get('lat'),
        'heat_index': calculate_heat_index(item.get('rating')),
        'cost': item.get('cost', 0),
        'address': item.get('address', ''),
        'open_time': None,
        'close_time': None,
        'review_count': item.get('review_count', 100)  # 默认值
    }

    # 添加营业时间
    open_time, close_time = get_opening_hours(category, index)
    record['open_time'] = open_time
    record['close_time'] = close_time

    processed_data.append(record)
    index += 1

# 保存结果
with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
    json.dump(processed_data, f, ensure_ascii=False, indent=2)

print(f"数据处理完成！")
print(f"输入: {len(raw_data)} 条")
print(f"输出: {len(processed_data)} 条")
print(f"保存到: {OUTPUT_FILE}")

# 统计类别分布
category_count = {}
for item in processed_data:
    cat = item['category']
    category_count[cat] = category_count.get(cat, 0) + 1

print(f"\n类别分布:")
for cat, count in sorted(category_count.items(), key=lambda x: x[1], reverse=True):
    print(f"  {cat}: {count}")
