from jinja2 import Environment, FileSystemLoader
from datetime import datetime, timedelta
import ephem

# 方位角を16方位に変換
def azimuth_to_direction(degree):
    directions = ["北", "北北東", "北東", "東北東", "東", "東南東", "南東", "南南東",
                  "南", "南南西", "南西", "西南西", "西", "西北西", "北西", "北北西"]
    index = int((degree + 11.25) % 360 // 22.5)
    return directions[index]

# 天体イベント取得
def get_events_for_date(jst_date):
    base_utc = datetime.combine(jst_date, datetime.min.time()) - timedelta(hours=9)
    tokyo = ephem.Observer()
    tokyo.lat, tokyo.lon = '35.6895', '139.6917'
    tokyo.date = base_utc.strftime('%Y/%m/%d')

    moon, sun = ephem.Moon(), ephem.Sun()
    moon.compute(tokyo)
    moon_age = tokyo.date - ephem.previous_new_moon(tokyo.date)
    size_percent = (moon.size / 3600) / 0.56 * 100

    def get_event(event_func, body):
        tokyo.date = base_utc.strftime('%Y/%m/%d')
        t = event_func(body)
        while ephem.localtime(t).date() != jst_date:
            tokyo.date = t + ephem.minute
            t = event_func(body)
        tokyo.date = t
        body.compute(tokyo)
        return {
            "time": ephem.localtime(t).strftime('%Y-%m-%d %H:%M:%S'),
            "az": round(body.az * 180 / ephem.pi, 1),
            "dir": azimuth_to_direction(body.az * 180 / ephem.pi)
        }

    return {
        "date": jst_date.strftime('%Y-%m-%d'),
        "moon_age": round(moon_age, 1),
        "moon_size_percent": round(size_percent, 1),
        "moonrise": get_event(tokyo.next_rising, moon),
        "moonset": get_event(tokyo.next_setting, moon),
        "sunrise": get_event(tokyo.next_rising, sun),
        "sunset": get_event(tokyo.next_setting, sun),
    }

# データ生成
today = datetime.now().date()
days = [get_events_for_date(today), get_events_for_date(today + timedelta(days=1))]

# HTML出力
env = Environment(loader=FileSystemLoader('.'))
template = env.get_template('index.html')
html = template.render(days=days)

with open('output.html', 'w', encoding='utf-8') as f:
    f.write(html)
