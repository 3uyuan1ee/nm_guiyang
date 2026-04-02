#!/usr/bin/env python3
"""
修复美食数据分类问题
根据店名关键词重新归类被错误分类的店铺，并根据新类别重新生成营业时间
"""

import json
import random

# 重新分类规则
reclassify_rules = {
    '烧烤夜市': ['铁板烧', '烤肉', '烤鱼', '烧烤', '烤吧', '烤鸡', '烙锅', '烤鸭', '烤全羊', '烤羊', '烤牛', '烤串', '铁板', '烤鱿鱼', '烤生蚝', '烤茄子', '烤韭菜', '花甲粉', '炸洋芋', '烤脑花', '爆浆豆腐', '板筋', '宵夜'],
    '火锅': ['火锅', '串串', '涮涮', '烫烫', '牛魔王', '重庆火锅', '老灶', '自助火锅', '豆捞', '涮羊肉', '羊蝎子', '夺夺粉', '清水烫', '酸汤鱼', '豆米火锅', '地摊火锅'],
    '咖啡': ['咖啡', 'Coffee', 'cafe', 'café', '星巴克', '烘焙工坊', '手冲', '精品咖啡', '慕希提', '灌木'],
    '酒吧': ['酒吧', '酒馆', 'Livehouse', 'Live House', '普洛', '威士忌', '啤酒馆', '精酿', '清吧', 'Bistro', '小酌'],
    '甜品糕点': ['甜品', '糕点', '蛋糕', '面包', '奶茶', '冰粉', '汤圆', '糖水', '西点', '烘焙', '甜点', '吐司', '冰浆', '洋芋粑', '糯米饭', '糍粑', '豆腐圆子'],
    '饮品': ['饮品', '果汁', '茶饮', '果茶', '奶盖', '柠檬茶', '蜜雪', '刺梨', '木姜子', '绿豆汤', '酸梅汤'],
    '特色餐饮': ['酸汤', '丝娃娃', '肠旺面', '恋爱豆腐果', '青岩豆腐', '黄粑', '折耳根', '豆花', '豆豉', '苗寨', '侗寨', '苗家', '侗家', '黔菜', '贵州菜', '辣子鸡', '老素粉', '牛肉粉', '羊肉粉', '花溪牛肉粉'],
}

# 默认营业时间配置
DEFAULT_HOURS = {
    '酒吧': {'open': '21:00', 'close': '04:00'},
    '烧烤夜市': {'open': '17:00', 'close': '03:00'},
    '火锅': {'open': '11:00', 'close': '02:00'},
    '咖啡': {'open': '09:00', 'close': '01:00'},
    '甜品糕点': {'open': '10:00', 'close': '22:00'},
    '饮品': {'open': '10:00', 'close': '22:00'},
    '特色餐饮': {'open': '10:00', 'close': '23:00'},
    '中餐厅': {'open': '10:00', 'close': '22:00'},
    '家常菜': {'open': '10:00', 'close': '22:00'},
    '快餐': {'open': '08:00', 'close': '21:00'},
    '地方菜系': {'open': '10:00', 'close': '22:00'},
    '异国料理': {'open': '11:00', 'close': '22:00'},
    '清真菜馆': {'open': '10:00', 'close': '22:00'},
}

# 需要过滤的非美食类别
filter_categories = {
    '商场', '培训机构', '生活服务场所', '公司企业', '宾馆酒店', '旅游景点',
    '休闲场所', '娱乐场所', '楼宇相关', '商务住宅相关', '公司', '其它'
}


def add_random_offset(time_str, offset_slots=1):
    """给时间添加随机扰动（以半小时为单位）"""
    hour, minute = map(int, time_str.split(':'))
    total_minutes = hour * 60 + minute

    # 偏移量以30分钟为单位
    offset_in_slots = random.randint(-offset_slots, offset_slots)
    offset_minutes = offset_in_slots * 30

    new_minutes = total_minutes + offset_minutes
    new_hour = (new_minutes // 60) % 24
    new_minute = new_minutes % 60

    # 确保分钟部分始终是 00 或 30
    aligned_minute = round(new_minute / 30) * 30 % 60
    if new_minute >= 60:
        new_hour = (new_hour + 1) % 24
    elif new_minute < 0:
        new_hour = (new_hour - 1 + 24) % 24

    return f'{new_hour:02d}:{aligned_minute:02d}'


def generate_hours_for_category(category):
    """根据类别生成营业时间"""
    default_hours = DEFAULT_HOURS.get(category, {'open': '10:00', 'close': '22:00'})
    return {
        'open_time': add_random_offset(default_hours['open'], offset_slots=2),
        'close_time': add_random_offset(default_hours['close'], offset_slots=2)
    }


def should_reclassify(name, current_category):
    """判断是否需要重新分类"""
    # 检查是否匹配重新分类规则
    for new_category, keywords in reclassify_rules.items():
        for keyword in keywords:
            if keyword in name:
                return new_category
    return None


def fix_data(input_file, output_file):
    """修复数据分类"""
    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)

    print(f'原始数据总数: {len(data)}')

    # 统计原始类别分布
    original_stats = {}
    for item in data:
        cat = item['category']
        original_stats[cat] = original_stats.get(cat, 0) + 1

    print('\n原始类别分布（主要类别）:')
    for cat, count in sorted(original_stats.items(), key=lambda x: -x[1])[:15]:
        print(f'  {cat}: {count}')

    # 重新分类并过滤
    fixed_data = []
    reclassify_stats = {}
    filter_stats = {}

    for item in data:
        name = item['name']
        current_cat = item['category']

        # 过滤掉非美食类别
        if current_cat in filter_categories:
            filter_stats[current_cat] = filter_stats.get(current_cat, 0) + 1
            continue

        # 检查是否需要重新分类
        new_category = should_reclassify(name, current_cat)
        if new_category and new_category != current_cat:
            reclassify_stats[new_category] = reclassify_stats.get(new_category, 0) + 1
            # 根据新类别生成营业时间
            new_hours = generate_hours_for_category(new_category)
            # 创建新的item，更新category和营业时间
            item = {
                **item,
                'category': new_category,
                'original_category': current_cat,
                'open_time': new_hours['open_time'],
                'close_time': new_hours['close_time']
            }

        fixed_data.append(item)

    print(f'\n过滤掉的非美食类别: {sum(filter_stats.values())} 条')
    for cat, count in sorted(filter_stats.items(), key=lambda x: -x[1]):
        print(f'  {cat}: {count}')

    print(f'\n重新分类统计: {sum(reclassify_stats.values())} 条')
    for cat, count in sorted(reclassify_stats.items(), key=lambda x: -x[1]):
        print(f'  {cat}: {count}')

    # 统计修复后的类别分布
    fixed_stats = {}
    for item in fixed_data:
        cat = item['category']
        fixed_stats[cat] = fixed_stats.get(cat, 0) + 1

    print(f'\n修复后数据总数: {len(fixed_data)}')
    print('\n修复后类别分布（主要类别）:')
    for cat, count in sorted(fixed_stats.items(), key=lambda x: -x[1])[:15]:
        print(f'  {cat}: {count}')

    return fixed_data


if __name__ == '__main__':
    input_file = 'src/assets/data/guiyang_food_data_enhanced.json'
    output_file = 'src/assets/data/guiyang_food_data_fixed.json'

    # 应用修复
    fixed_data = fix_data(input_file, output_file)

    # 保存修复后的数据
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(fixed_data, f, ensure_ascii=False, indent=2)

    print(f'\n已保存修复后的数据到: {output_file}')
