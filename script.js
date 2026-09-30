document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('calcForm');
  const result = document.getElementById('calcResult');

  if (!form || !result) return;

  const HEAVENLY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  const EARTHLY_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  const STEM_ELEMENTS = ['Дерево', 'Дерево', 'Огонь', 'Огонь', 'Земля', 'Земля', 'Металл', 'Металл', 'Вода', 'Вода'];
  const BRANCH_ELEMENTS = ['Вода', 'Земля', 'Дерево', 'Дерево', 'Земля', 'Огонь', 'Огонь', 'Земля', 'Металл', 'Металл', 'Земля', 'Вода'];

  const SOLAR_TERM_BOUNDARIES = [
    { month: 2, day: 4, name: '立春' },
    { month: 3, day: 6, name: '惊蛰' },
    { month: 4, day: 5, name: '清明' },
    { month: 5, day: 6, name: '立夏' },
    { month: 6, day: 6, name: '芒种' },
    { month: 7, day: 7, name: '小暑' },
    { month: 8, day: 8, name: '立秋' },
    { month: 9, day: 8, name: '白露' },
    { month: 10, day: 8, name: '寒露' },
    { month: 11, day: 7, name: '立冬' },
    { month: 12, day: 7, name: '大雪' },
    { month: 1, day: 6, name: '小寒' }
  ];

  function getJulianDay(year, month, day) {
    if (month <= 2) {
      year -= 1;
      month += 12;
    }
    const a = Math.floor(year / 100);
    const b = 2 - a + Math.floor(a / 4);
    return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + b - 1524.5;
  }

  function getYearPillar(year, month, day) {
    let baziYear = year;
    if (month < 2 || (month === 2 && day < 4)) {
      baziYear -= 1;
    }
    const stemIndex = (baziYear - 4) % 10;
    const branchIndex = (baziYear - 4) % 12;
    return {
      stem: HEAVENLY_STEMS[stemIndex],
      branch: EARTHLY_BRANCHES[branchIndex],
      stemElement: STEM_ELEMENTS[stemIndex],
      branchElement: BRANCH_ELEMENTS[branchIndex]
    };
  }

  function getMonthPillar(year, month, day, yearStemIndex) {
    let solarMonthIndex = 0;
    let found = false;
    for (let i = 0; i < SOLAR_TERM_BOUNDARIES.length; i++) {
      const term = SOLAR_TERM_BOUNDARIES[i];
      if (month === term.month && day >= term.day) {
        solarMonthIndex = i;
        found = true;
        break;
      }
      if (month === term.month && day < term.day) {
        solarMonthIndex = i - 1;
        if (solarMonthIndex < 0) solarMonthIndex = 11;
        found = true;
        break;
      }
    }
    if (!found) {
      solarMonthIndex = SOLAR_TERM_BOUNDARIES.length - 1;
    }

    const branchIndex = (solarMonthIndex + 2) % 12;
    const stemBase = (yearStemIndex % 5) * 2 + 2;
    const monthStemIndex = (stemBase + solarMonthIndex) % 10;

    return {
      stem: HEAVENLY_STEMS[monthStemIndex],
      branch: EARTHLY_BRANCHES[branchIndex],
      stemElement: STEM_ELEMENTS[monthStemIndex],
      branchElement: BRANCH_ELEMENTS[branchIndex]
    };
  }

  function getDayPillar(year, month, day) {
    const jdn = getJulianDay(year, month, day);
    const dayIndex = Math.floor(jdn + 0.5) % 60;
    const stemIndex = dayIndex % 10;
    const branchIndex = dayIndex % 12;

    return {
      stem: HEAVENLY_STEMS[stemIndex],
      branch: EARTHLY_BRANCHES[branchIndex],
      stemElement: STEM_ELEMENTS[stemIndex],
      branchElement: BRANCH_ELEMENTS[branchIndex],
      stemIndex: stemIndex
    };
  }

  function getHourPillar(hour, dayStemIndex) {
    let branchValue = Math.round(hour / 2) - 1;
    if (branchValue < 1) {
      branchValue += 12;
    }
    const branchIndex = (branchValue - 1) % 12;

    let stemBase = (dayStemIndex % 5) * 2;
    if (stemBase < 0) stemBase += 10;

    const stemIndex = (stemBase + branchIndex) % 10;

    return {
      stem: HEAVENLY_STEMS[stemIndex],
      branch: EARTHLY_BRANCHES[branchIndex],
      stemElement: STEM_ELEMENTS[stemIndex],
      branchElement: BRANCH_ELEMENTS[branchIndex]
    };
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const dateVal = document.getElementById('birthDate').value;
    const timeVal = document.getElementById('birthTime').value;

    if (!dateVal || !timeVal) {
      result.hidden = false;
      result.innerHTML = '<p>Пожалуйста, заполните дату и время рождения.</p>';
      return;
    }

    const [year, month, day] = dateVal.split('-').map(Number);
    const [hour, minute] = timeVal.split(':').map(Number);

    const yearPillar = getYearPillar(year, month, day);
    const yearStemIndex = HEAVENLY_STEMS.indexOf(yearPillar.stem);
    const monthPillar = getMonthPillar(year, month, day, yearStemIndex);
    const dayPillar = getDayPillar(year, month, day);
    const hourPillar = getHourPillar(hour, dayPillar.stemIndex);

    const pillars = [
      { title: 'Год', pillar: yearPillar },
      { title: 'Месяц', pillar: monthPillar },
      { title: 'День', pillar: dayPillar },
      { title: 'Час', pillar: hourPillar }
    ];

    let html = '<p><strong>Ваша карта рождения:</strong></p>';
    html += '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-top:16px;">';

    pillars.forEach(item => {
      html += `
        <div style="text-align:center;padding:16px;background:#faf7fd;border-radius:14px;">
          <div style="font-size:12px;color:#6b6b7b;margin-bottom:8px;">${item.title}</div>
          <div style="font-size:28px;font-weight:700;color:#a855f7;">${item.pillar.stem}${item.pillar.branch}</div>
          <div style="font-size:13px;color:#6b6b7b;margin-top:8px;">${item.pillar.stemElement} / ${item.pillar.branchElement}</div>
        </div>
      `;
    });

    html += '</div>';
    html += '<p style="margin-top:20px;font-size:14px;color:#6b6b7b;">Сохраните эту карту. Она пригодится при дальнейшем анализе вашего личного потенциала.</p>';

    result.hidden = false;
    result.innerHTML = html;
  });
});