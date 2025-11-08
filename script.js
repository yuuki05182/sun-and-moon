const lat = 35.6895;
const lon = 139.6917;
const now = new Date();

function formatTime(date) {
  return date instanceof Date
    ? date.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })
    : "なし";
}

function formatAzimuth(rad) {
  if (rad === undefined) return "なし";
  const deg = (rad * 180 / Math.PI + 180) % 360;
  const direction = azimuthToDirection(deg);
  return `${deg.toFixed(1)}°<br><small>${direction}</small>`;
}

function azimuthToDirection(deg) {
  const directions = [
    "北", "北北東", "北東", "東北東",
    "東", "東南東", "南東", "南南東",
    "南", "南南西", "南西", "西南西",
    "西", "西北西", "北西", "北北西"
  ];
  const index = Math.round(deg / 22.5) % 16;
  return directions[index];
}

function createRow(label, todayVal, todayAz, tomorrowVal, tomorrowAz) {
  return `<tr>
    <td>${label}</td>
    <td>${todayVal}</td>
    <td>${todayAz}</td>
    <td>${tomorrowVal}</td>
    <td>${tomorrowAz}</td>
  </tr>`;
}

function updateTable() {
  document.getElementById("now").textContent = now.toLocaleString("ja-JP");

  const moonIllum = SunCalc.getMoonIllumination(now);
  const moonAge = (moonIllum.phase * 29.53).toFixed(1);
  document.getElementById("moon-age").textContent = moonAge;

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const sunToday = SunCalc.getTimes(today, lat, lon);
  const sunTomorrow = SunCalc.getTimes(tomorrow, lat, lon);
  const moonToday = SunCalc.getMoonTimes(today, lat, lon);
  const moonTomorrow = SunCalc.getMoonTimes(tomorrow, lat, lon);

  const tbody = document.getElementById("data-body");
  tbody.innerHTML = "";

  const sunAzTodayRise = formatAzimuth(SunCalc.getPosition(sunToday.sunrise, lat, lon).azimuth);
  const sunAzTomorrowRise = formatAzimuth(SunCalc.getPosition(sunTomorrow.sunrise, lat, lon).azimuth);
  const sunAzTodaySet = formatAzimuth(SunCalc.getPosition(sunToday.sunset, lat, lon).azimuth);
  const sunAzTomorrowSet = formatAzimuth(SunCalc.getPosition(sunTomorrow.sunset, lat, lon).azimuth);

  const moonAzTodayRise = moonToday.rise ? formatAzimuth(SunCalc.getMoonPosition(moonToday.rise, lat, lon).azimuth) : "なし";
  const moonAzTomorrowRise = moonTomorrow.rise ? formatAzimuth(SunCalc.getMoonPosition(moonTomorrow.rise, lat, lon).azimuth) : "なし";
  const moonAzTodaySet = moonToday.set ? formatAzimuth(SunCalc.getMoonPosition(moonToday.set, lat, lon).azimuth) : "なし";
  const moonAzTomorrowSet = moonTomorrow.set ? formatAzimuth(SunCalc.getMoonPosition(moonTomorrow.set, lat, lon).azimuth) : "なし";

  tbody.innerHTML += createRow("🌞 日の出", formatTime(sunToday.sunrise), sunAzTodayRise, formatTime(sunTomorrow.sunrise), sunAzTomorrowRise);
  tbody.innerHTML += createRow("🌞 日の入り", formatTime(sunToday.sunset), sunAzTodaySet, formatTime(sunTomorrow.sunset), sunAzTomorrowSet);
  tbody.innerHTML += createRow("🌕 月の出", formatTime(moonToday.rise), moonAzTodayRise, formatTime(moonTomorrow.rise), moonAzTomorrowRise);
  tbody.innerHTML += createRow("🌕 月の入り", formatTime(moonToday.set), moonAzTodaySet, formatTime(moonTomorrow.set), moonAzTomorrowSet);
}

updateTable();
