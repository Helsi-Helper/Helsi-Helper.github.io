init()

function template(strings, ...keys) {
  return (...values) => {
    const result = [strings[0]]
    keys.forEach((key, i) => {
      const value = values[key]
      result.push(value, strings[i + 1])
    })
    return result.join('');
  }
}

function init() {
  update_ecg_result()
  update_ecg_conclusion()
  update_gfr()
}

function by_id(id) {
  return document.getElementById(id)
}

function value_by_id(id) {
  return by_id(id).value
}

function update_ecg_result() {
  let result_template = template`P - ${0} мс, PQ - ${1} мс, QRS - ${2} мс, QT - ${3} мс, QTc - ${4} мс, ∠α - ${5}°.`  

  let p = value_by_id('ecg_p')
  let pq = value_by_id('ecg_pq')
  let qrs = value_by_id('ecg_qrs')
  let qt = value_by_id('ecg_qt')
  let qtc = value_by_id('ecg_qtc')
  let α = value_by_id('ecg_α')

  by_id('ecg_result').innerText = result_template(p, pq, qrs, qt, qtc, α)
}

function update_ecg_conclusion() {
  let conclusion_template = template`Ритм синусовий${0}. ЧСС - ${1} за хв.${2}${3}${4}`

  let rhythm = value_by_id('ecg_rhythm')
  rhythm = rhythm 
           ? ', ' + rhythm.toLowerCase()
           : ' правильний'
  let hr = value_by_id('ecg_hr')
  let eha = by_id('ecg_eha').value || by_id('ecg_eha').placeholder 
  let lvc = value_by_id('ecg_lvc')
  let vcc_1 = value_by_id('ecg_vcc_1')
  let vcc_2 = value_by_id('ecg_vcc_2')
  let vcc

  if (eha) {
    eha = ` ЕВС ${eha.toLowerCase()}.`
  }
  if (lvc) {
    lvc = ` ${lvc} лівого шлуночка.`
  }
  if (vcc_1 && vcc_2) {
    vcc = ` ${vcc_1} ${vcc_2} шлуночкового комплексу.`
  }

  by_id('ecg_conclusion').innerText = conclusion_template(rhythm, hr, eha, lvc, vcc)
}

function clear_value(event) {
  event.target.value = ''
}

function copy_to_clipboard(event, text) {
  navigator.clipboard.writeText(text)

  let target = event.target
  target.setAttribute('tooltip', 'Copied!')
}

function restore_tooltip(target, value) {
  target.setAttribute('tooltip', value)
}

function update_gfr() {
  let result_template = template`Кокрофт-Голт(норм) - ${0} мл/хв/1,73 м², MDRD - ${1} мл/хв/1,73 м², CKD-EPI - ${2} мл/хв/1.73 м², Площа поверхні тіла - ${3} м², Індекс маси тіла - ${4} кг/м².`
  let conclusion_template = template`ШКФ ${0} мл/хв/1,73 м²: ураження нирок із ${1}.`
  
  let male = by_id('gfr_sex_male').checked
  let creatinine = value_by_id('gfr_creatinine')
  let age = value_by_id('gfr_age')
  let mass = value_by_id('gfr_mass')
  let height = value_by_id('gfr_height')
  let cg, mdrd, epi, bsa, bmi, grf, grf_characteristic

  if (creatinine && age && mass && height) {
    cg = 88 * (140 - age) * mass / (72 * creatinine)
    mdrd = 175 * Math.pow(creatinine / 88.4, -1.154) * Math.pow(age, -.203)
    bsa = 0.007184 * Math.pow(height, .725) * Math.pow(mass, .425)
    bmi = 10000 * mass / height / height

    epi = 141
    if (male) {
      epi *= creatinine > 80
            ? Math.pow(creatinine * 0.0113 / 0.9, -1.209)
            : Math.pow(creatinine * 0.0113 / 0.9, -0.411)
    } else {
      cg *= .85
      mdrd *= .742
      epi *= creatinine > 62
            ? Math.pow(creatinine * 0.0113 / 0.7, -1.209)
            : Math.pow(creatinine * 0.0113 / 0.7, -0.329)
    }

    cg = Math.round(cg * 1.73 / bsa)
    mdrd = Math.round(mdrd)
    epi = Math.round(epi * Math.pow(0.993, age))
    bsa = Math.round(100 * bsa) / 100
    bmi = Math.round(10 * bmi) / 10

    let grf_avg = (cg + mdrd + epi) / 3
    if (grf_avg >= 90) {
      grf = '≥90'
      grf_characteristic = 'ХНН-I з нормальною або збільшеною ШКФ'
    } else if (grf_avg >= 60) {
      grf = '60-89'
      grf_characteristic = 'ХНН-II з помірним зниженням ШКФ'
    } else if (grf_avg >= 30) {
      grf = '30-59'
      grf_characteristic = 'ХНН-III з середнім ступенем зниження ШКФ'
    } else if (grf_avg >= 15) {
      grf = '15-29'
      grf_characteristic = 'ХНН-IV зі значним ступенем зниження ШКФ'
    } else {
      grf = '<15'
      grf_characteristic = 'термінальню ХНН-V'
    }
  }

  by_id('gfr_result').innerText = result_template(cg, mdrd, epi, bsa, bmi)
  by_id('gfr_conclusion').innerText = conclusion_template(grf, grf_characteristic)
}