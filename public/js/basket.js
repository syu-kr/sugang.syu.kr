const COUNT_PER_PAGE = 50

let datas = []

async function getRequest(year, semester) {
  const getResponse = await fetch(`/api/${year}-${semester}`, {
    method: 'get',
  })
  const getJson = await getResponse.json()
  return getJson
}

function rankConvert(value) {
  if (value == 1) return '<div style="display: flex; justify-content: center;"><img class="rank" src="/1.png" width="24px"></div>'
  else if (value == 2) return '<div style="display: flex; justify-content: center;"><img class="rank" src="/2.png" width="24px"></div>'
  else if (value == 3) return '<div style="display: flex; justify-content: center;"><img class="rank" src="/3.png" width="24px"></div>'
  else return '<span><b>' + value + '</b></span>'
}

function competitionColor(value) {
  if (value >= 4) return 'red'
  if (value >= 3) return '#ff7070'
  else if (value >= 2) return 'orange'
  else if (value >= 1) return '#cdcd00'
  else return '#00ff00'
}

function convertTime(datetimeStr) {
  const date = new Date(datetimeStr.replace(' ', 'T'))

  const fullYear = date.getFullYear()
  const year = `'${String(fullYear).slice(-2)}`
  const month = date.getMonth() + 1
  const day = date.getDate()

  let hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  const isPM = hour >= 12
  const period = isPM ? '오후' : '오전'

  hour = hour % 12
  hour = hour === 0 ? 12 : hour

  return `마지막 업데이트: ${year}년 ${month}월 ${day}일 ${period} ${hour}시 ${minute}분`
}

const setPageButtons = (pageNumber) => {
  let number_tag = ''

  for (let i = 1; i <= Math.ceil(datas['data'].length / COUNT_PER_PAGE); i++) {
    if (i == pageNumber) {
      number_tag += `<div style="display: inline-block; cursor: pointer; width: 30px; margin: 5px; color: black; font-weight: bold; onclick="setPageOf(${i})"> ${i} </div>`
    } else {
      number_tag += `<div style="display: inline-block; cursor: pointer; width: 30px; margin: 5px; color: gray;" onclick="setPageOf(${i})"> ${i} </div>`
    }
  }

  document.getElementById('number-button-wrapper').innerHTML = number_tag
}

const setPageOf = (pageNumber) => {
  let tbody_tag = ''
  let apply = 0
  let limit = 0
  let cmpt = 0

  document.getElementById('time').innerHTML = convertTime(datas['time'])

  setPageButtons(pageNumber)

  for (let i = COUNT_PER_PAGE * (pageNumber - 1) + 1; i <= COUNT_PER_PAGE * (pageNumber - 1) + COUNT_PER_PAGE && i <= datas['data'].length; i++) {
    competition = parseFloat(datas['data'][i - 1]['경쟁률']).toFixed(2)

    apply += parseInt(datas['data'][i - 1]['장바구니'])
    limit += parseInt(datas['data'][i - 1]['제한인원'])

    tbody_tag += `
    <tr>
      <td align="center" style="border-right-width: 1px" nowrap>${rankConvert(datas['data'][i - 1]['순위'])}</td>
      <td class="col-courseNo ${!colStates.courseNo ? 'hidden-col' : ''}" align="center" nowrap><span style="color: #5f6062;">${datas['data'][i - 1]['강좌번호']}</span></td>
      <!--<td nowrap><span style="color: #5f6062;">${datas['data'][i - 1]['학부(과)']}</span></td>-->
      <td nowrap><strong><span>${datas['data'][i - 1]['강좌명']}</strong></span>
      <span class="col-professor ${!colStates.professor ? 'hidden-col' : ''}" id="professor">(${datas['data'][i - 1]['교수명']})</span>
      </td>
      <!--<td nowrap><span>${datas['data'][i - 1]['교수명']}</span></td>-->
	    <td class="col-count ${!colStates.count ? 'hidden-col' : ''}" nowrap><span><span style="color: ${competitionColor(competition)};">${datas['data'][i - 1]['장바구니']}</span>/${datas['data'][i - 1]['제한인원']}</span></td>
      <!--<td nowrap><span>${datas['data'][i - 1]['제한인원']}</span></td>
      <td nowrap><span>${datas['data'][i - 1]['장바구니']}</span></td>-->
      <td class="col-rate ${!colStates.rate ? 'hidden-col' : ''}" align="center" nowrap><b><span style="color: ${competitionColor(competition)};">${competition}:1</span></b></td>
    </tr>
    `
  }
  tbody_tag += `
    <!--<tr>
      <td colspan="3" align="center">총 계</td>
      <td class="col-count" nowrap><strong>${apply}</strong>/${limit}</td>
      <td align="center" nowrap>${(apply / limit).toFixed(2)}:1</td>
    </tr>-->`

  document.getElementById('info').innerHTML = tbody_tag
}

const urlParams = new URLSearchParams(window.location.search)
const year = urlParams.get('year') || 2025
const semester = urlParams.get('semester') || 2

getRequest(year, semester)
  .then((data) => {
    data['data'].sort((a, b) => b['경쟁률'] - a['경쟁률'])
    datas = data
    datas['data'].forEach((item, index) => {
      item['순위'] = index + 1
    })
    const params = new URLSearchParams(window.location.search)
    const search = params.get('search') || ''
    if (search) {
      const lowerSearch = search.toLowerCase()
      datas['data'] = datas['data'].filter((item) => {
        return item['강좌명'].toLowerCase().includes(lowerSearch) || item['교수명'].toLowerCase().includes(lowerSearch) || item['강좌번호'].toLowerCase().includes(lowerSearch)
      })
    }
    setPageOf(1)
  })
  .catch((error) => {
    console.log(error)
    // alert('데이터를 가져오는 데 실패했습니다.')
    // window.location.href = '/basket'
  })
