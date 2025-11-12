// UBT Exam System — Q1..Q40. Audio plays limited to 2 times per file.
// Selections in-memory only.
document.addEventListener('DOMContentLoaded', () => {
  // elements
  const loginCard = document.getElementById('loginCard');
  const brightnessCard = document.getElementById('brightnessCard');
  const volumeCard = document.getElementById('volumeCard');
  const infoCard = document.getElementById('infoCard');
  const startCard = document.getElementById('startCard');
  const examCard = document.getElementById('examCard');
  const questionViewCard = document.getElementById('questionViewCard');

  const loginForm = document.getElementById('loginForm');
  const examinee = document.getElementById('examinee');
  const fullname = document.getElementById('fullname');
  const dob = document.getElementById('dob');
  const msg = document.getElementById('msg');

  const infoExaminee = document.getElementById('infoExaminee');
  const infoName = document.getElementById('infoName');
  const infoDob = document.getElementById('infoDob');
  const startExaminee = document.getElementById('startExaminee');
  const startName = document.getElementById('startName');
  const candidateId = document.getElementById('candidateId');
  const timerEl = document.getElementById('timer');

  const brightnessRange = document.getElementById('brightnessRange');
  const brightnessValue = document.getElementById('brightnessValue');
  const backLogin = document.getElementById('backLogin');
  const toVolume = document.getElementById('toVolume');

  const volumeRange = document.getElementById('volumeRange');
  const playKorean = document.getElementById('playKorean');
  const backBrightness = document.getElementById('backBrightness');
  const toInfo = document.getElementById('toInfo');

  const backVolume = document.getElementById('backVolume');
  const toStart = document.getElementById('toStart');

  const backInfo = document.getElementById('backInfo');
  const startExamBtn = document.getElementById('startExamBtn');

  const gridReading = document.getElementById('gridReading');
  const gridListening = document.getElementById('gridListening');
  const finishExamBtn = document.getElementById('finishExamBtn');
  const examBackBtn = document.getElementById('examBackBtn');

  const qInstruction = document.getElementById('qInstruction');
  const qImage = document.getElementById('qImage');
  const qMediaWrap = document.getElementById('qMediaWrap');
  const audioIcon = document.getElementById('audioIcon');
  const audioPlayBtn = document.getElementById('audioPlayBtn');
  const audioStatus = document.getElementById('audioStatus');
  const qAudio = document.getElementById('qAudio');
  const audioThumbImg = document.querySelector('#audioIcon img.small-thumb');

  const questionViewTitle = document.getElementById('questionViewTitle');
  const qStemLabel = document.getElementById('qStemLabel');
  const qStemContent = document.getElementById('qStemContent');
  const qOptions = document.getElementById('qOptions');
  const qPrevBtn = document.getElementById('qPrevBtn');
  const qNextBtn = document.getElementById('qNextBtn');
  const allQBtn = document.getElementById('allQBtn');

  // lightbox modal
  const imgModal = document.getElementById('imgModal');
  const modalImg = document.getElementById('modalImg');

  // config
  const READING_COUNT = 20;
  const LISTENING_START = 21;
  const LISTENING_END = 40; // extended to 40 (Q37..Q40 present)
  const EXAM_DURATION_SECONDS = 50 * 60;
  const MARKS_PER_QUESTION = 2.5; // each main exam question = 2.5 marks
  const COLOR_TEST_COUNT = 12;
  const COLOR_TEST_MARK = 1; // per color-test question

  // timer (persisted)
  let timerInterval = null;
  const msNow = () => Date.now();
  const setExamEndTimeFromNow = (seconds) => {
    const end = msNow() + seconds * 1000;
    localStorage.setItem('exam_end_time', String(end));
    return end;
  };
  const getExamEndTime = () => parseInt(localStorage.getItem('exam_end_time') || '0', 10);
  const clearExamEndTime = () => localStorage.removeItem('exam_end_time');

  function updateTimerDisplay(sec) {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    timerEl.textContent = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  }

  function startTimer() {
    stopTimer();
    let end = getExamEndTime();
    if (!end || end < msNow()) end = setExamEndTimeFromNow(EXAM_DURATION_SECONDS);

    function tick() {
      const remain = Math.floor((end - msNow()) / 1000);
      if (remain <= 0) {
        updateTimerDisplay(0);
        stopTimer();
        clearExamEndTime();
        alert("Time's up! Auto-submitting...");
        return;
      }
      updateTimerDisplay(remain);
    }
    tick();
    timerInterval = setInterval(tick, 1000);
  }

  function stopTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = null;
  }

  const savedEnd = getExamEndTime();
  if (savedEnd && savedEnd > msNow()) startTimer();
  else updateTimerDisplay(EXAM_DURATION_SECONDS);

  // answers: in-memory only
  const answersMap = {};   // e.g. { 'R1': '2' }
  const answeredSet = new Set();

  // audio play counters: track plays per audio file (max 2)
  const audioPlayCounts = {}; // { '21-T.mp3': 1 }

  function keyFor(n) {
    return (n >= LISTENING_START) ? `L${n}` : `R${n}`;
  }

  // login flow
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    msg.textContent = '';
    if (!examinee.value.trim()) { msg.textContent = 'Enter Examinee Number'; return; }
    if (!dob.value) { msg.textContent = 'Select DOB'; return; }

    localStorage.setItem('exam_examinee', examinee.value.trim());
    localStorage.setItem('exam_fullname', fullname.value.trim());
    localStorage.setItem('exam_dob', dob.value);

    candidateId.textContent = examinee.value.trim();
    loginCard.hidden = true;
    brightnessCard.hidden = false;
  });

  // brightness live
  if (brightnessRange && brightnessValue) {
    brightnessRange.addEventListener('input', () => {
      const val = parseFloat(brightnessRange.value);
      document.body.style.filter = `brightness(${val})`;
      brightnessValue.textContent = Math.round(val * 100) + '%';
    });
  }
  backLogin.addEventListener('click', () => { brightnessCard.hidden = true; loginCard.hidden = false; });
  toVolume.addEventListener('click', () => { document.body.style.filter = `brightness(${brightnessRange.value})`; brightnessCard.hidden = true; volumeCard.hidden = false; });

  // volume TTS
  if (playKorean) {
    playKorean.addEventListener('click', () => {
      const u = new SpeechSynthesisUtterance('한국 사랑해');
      u.lang = 'ko-KR';
      u.volume = parseFloat(volumeRange.value || '1');
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    });
  }
  backBrightness.addEventListener('click', () => { volumeCard.hidden = true; brightnessCard.hidden = false; });
  toInfo.addEventListener('click', () => {
    infoExaminee.textContent = examinee.value || '-';
    infoName.textContent = fullname.value || '-';
    infoDob.textContent = dob.value || '-';
    volumeCard.hidden = true; infoCard.hidden = false;
  });

  // info
  backVolume.addEventListener('click', () => { infoCard.hidden = true; volumeCard.hidden = false; });
  toStart.addEventListener('click', () => { startExaminee.textContent = examinee.value || '-'; startName.textContent = fullname.value || '-'; infoCard.hidden = true; startCard.hidden = false; });

  // start exam
  backInfo.addEventListener('click', () => { startCard.hidden = true; infoCard.hidden = false; });
  startExamBtn.addEventListener('click', () => {
    // reset in-memory answers and audio counts
    for (const k in answersMap) delete answersMap[k];
    answeredSet.clear();
    for (const k in audioPlayCounts) delete audioPlayCounts[k];

    startCard.hidden = true; examCard.hidden = false;
    clearExamEndTime(); setExamEndTimeFromNow(EXAM_DURATION_SECONDS); startTimer();
    buildPalette(); bindPaletteToOpenQuestions();
  });

  // build palette
  function buildPalette() {
    if (!gridReading || !gridListening) return;
    gridReading.innerHTML = ''; gridListening.innerHTML = '';

    for (let i=1;i<=READING_COUNT;i++){
      const d = document.createElement('div');
      d.className = 'q-item'; d.textContent = i; d.dataset.q = `R${i}`; d.tabIndex = 0;
      if (answeredSet.has(`R${i}`)) d.classList.add('answered');
      d.addEventListener('click', ()=> openQuestion(i));
      gridReading.appendChild(d);
    }
    for (let i=LISTENING_START;i<=LISTENING_END;i++){
      const d = document.createElement('div');
      d.className = 'q-item'; d.textContent = i; d.dataset.q = `L${i}`; d.tabIndex = 0;
      if (answeredSet.has(`L${i}`)) d.classList.add('answered');
      d.addEventListener('click', ()=> openQuestion(i));
      gridListening.appendChild(d);
    }
  }

  // question data through Q35
  function getQuestionData(qNum){
    if (qNum === 1) return { title:`Question ${qNum}`, instruction:'다음을 보고 맞는 단어나 문장을 고르십시오.', image:'q1.png', options:['① 볼펜입니다.','② 가위입니다.','③ 안경입니다.','④ 가방입니다.'], correct:'4' };
    if (qNum === 2) return { title:`Question ${qNum}`, instruction:'다음을 보고 맞는 단어나 문장을 고르십시오.', image:'q2.png', options:['① 지게차입니다.','② 굴착기입니다.','③ 트랙터입니다.','④ 경운기입니다.'], correct:'1' };
    if (qNum === 3) return { title:`Question ${qNum}`, instruction:'다음을 보고 맞는 단어나 문장을 고르십시오.', image:'q3.png', options:['① 책을 읽고 있습니다.','② 밥을 먹고 있습니다.','③ 친구를 만나고 있습니다.','④ 피아노를 치고 있습니다.'], correct:'4' };
    if (qNum === 4) return { title:`Question ${qNum}`, instruction:'다음을 보고 맞는 단어나 문장을 고르십시오.', image:'q4.png', options:['① 전기가 흐르니까 조심하세요.','② 떨어질 수 있으니까 조심하세요.','③ 바닥이 미끄러우니까 조심하세요.','④ 불이 붙을 수 있으니까 조심하세요.'], correct:'2' };
    if (qNum === 5) return { title:`Question ${qNum}`, instruction:'5.다음 중 밑줄 친 부분이 맞는 것은 무엇입니까?', image:null, options:['① 집<span class="uline">을</span> 작아요.','② 딸기<span class="uline">가</span> 먹어요.','③ 회사<span class="uline">에</span> 다녀요.','④ 겨울<span class="uline">에서</span> 추워요.'], correct:'3' };
    if (qNum === 6) return { title:`Question ${qNum}`, instruction:'6.다음 중 밑줄 친 부분이 맞는 것은 무엇입니까?', image:null, options:['① 퇴근할 때 문을 <span class="uline">달으세요</span>.','② 친구한테서 선물을 <span class="uline">받았어요</span>.','③ 심심하면 한국 노래를 <span class="uline">듣어요</span>.','④ 오늘 시내에서 많이 <span class="uline">걷었어요</span>.'], correct:'2' };
    if (qNum === 7) return { title:`Question ${qNum}`, instruction:'[7~10] 다음 글을 읽고 물음에 답하십시오.\n7. 이 병원이 문을 여는 시간은 언제입니까?', image:'q7.png', options:['① 부천시입니다.','② 김미소입니다.','③ 튼튼치과입니다.','④ 오전 아홉 시입니다.'], correct:'4' };
    if (qNum === 8) return { title:`Question ${qNum}`, instruction:'8. 다음 단어와 관계있는 것은 무엇입니까?', image:'q8.png', options:['1. 컴퓨터','2. 작업복','3. 비빔밥','4. 기차표'], correct:'2' };
    if (qNum === 9) return { title:`Question ${qNum}`, instruction:'9. 다음 단어와 관계있는 것은 무엇입니까?', image:'q9.png', options:['① 근로자가 일하는 곳이에요.','② 근로자가 거주하는 곳이에요.','③ 근로자가 운동하는 곳이에요.','④ 근로자가 상담하는 곳이에요.'], correct:'1' };
    if (qNum === 10) return { title:`Question ${qNum}`, instruction:'10. 한국의 수산물 수입 현황에 대한 설명으로 맞는 것은 무엇입니까?', image:'q10.png', options:['① 한국은 수산물을 중국에서 가장 많이 수입합니다.','② 한국이 수입하는 수산물 중 베트남산은 5% 미만입니다.','③ 한국이 수산물을 수입하는 국가 중 2위는 노르웨이입니다.','④ 한국은 미국보다 러시아에서 수산물을 더 많이 수입합니다.'], correct:'4' };
    if (qNum === 11) return { title:`Question ${qNum}`, instruction:'빈칸에 들어갈 가장 알맞은 것을 고르십시오.', image:'q11.png', options:['1. 가족 모임','2. 생일 선물','3. 출근 시간','4. 통장 입금'], correct:'4' };
    if (qNum === 12) return { title:`Question ${qNum}`, instruction:'12. 빈칸에 들어갈 가장 알맞은 것을 고르십시오.', image:'q12.png', options:['① 듣느라고','② 들으려고','③ 들으면서','④ 듣자마자'], correct:'3' };
    if (qNum === 13) return { title:`Question ${qNum}`, instruction:'13. 빈칸에 들어갈 가장 알맞은 것을 고르십시오.', image:'q13.png', options:['① 조심하게','② 조심해서','③ 서두르게','④ 서둘러서'], correct:'4' };
    if (qNum === 14) return { title:`Question ${qNum}`, instruction:'14. 빈칸에 들어갈 가장 알맞은 것을 고르십시오.', image:'q14.png', options:['① 틀면','② 틀고','③ 틀려면','④ 틀려고'], correct:'2' };
    if (qNum === 15) return { title:`Question ${qNum}`, instruction:'15. 빈칸에 들어갈 가장 알맞은 것을 고르십시오.', image:'q15.png', options:['① 맞는 것이 좋습니다','② 놓는 것이 좋습니다','③ 맞지 않도록 합니다','④ 놓지 않도록 합니다'], correct:'1' };
    if (qNum === 16) return { title:`Question ${qNum}`, instruction:'16. 빈칸에 들어갈 가장 알맞은 것을 고르십시오.', image:'q16.png', options:['① 반사 조끼를 착용해야 합니다','② 보호 장갑을 구매해야 합니다','③ 비상 계단을 이용해야 합니다','④ 환기 장치를 작동해야 합니다'], correct:'1' };
    if (qNum === 17) return { title:`Question ${qNum}`, instruction:'17. 다음 설명에 알맞은 어휘를 고르십시오.', image:'q17.png', options:['① 토치','② 펜치','③ 쇠톱','④ 망치'], correct:'2' };
    if (qNum === 18) return { title:`Question ${qNum}`, instruction:'18. 다음 글을 읽고 무엇에 대한 글인지 고르십시오', image:'q18.png', options:['1 계절 음식','2 음식 재료','3 조리 방법','4 조리 시기'], correct:'1' };
    if (qNum === 19) return { title:`Question ${qNum}`, instruction:'19. 다음 글을 읽고 내용과 같은 것을 고르십시오', image:'q19.png', options:['1 사내 휴게실의 출입문 비밀번호는 따로 없습니다.','2 회사 직원은 누구나 휴게실을 이용할 수 있습니다.','3 휴게실 이용 후에는 문을 열어 두고 나가야 합니다.','4 점심 도시락을 싸 가서 휴게실에서 먹을 수 있습니다.'], correct:'2' };
    if (qNum === 20) return { title:`Question ${qNum}`, instruction:'20. 다음 글을 읽고 내용과 같은 것을 고르십시오.', image:'q20.png', options:['1 사업주는 4대 사회보험에 모두 가입해야 합니다.','2 산재보험은 근로자와 사업주가 모두 가입해야 합니다.','3 사업주는 사고가 발생하면 보험금을 받을 수 있습니다.','4 근로자는 가입하고 싶은 보험을 선택하여 가입할 수 있습니다.'], correct:'1' };

    // Q21 (21-T.mp3)
    if (qNum === 21) {
      return {
        title:`Question ${qNum}`,
        instruction:'21. 들은 것을 고르십시오.',
        image: null,
        audio: '21-T.mp3',
        options:[
          '1 가구',
          '2 기구',
          '3 가게',
          '4 거기'
        ],
        correct: '1'
      };
    }

    // Q22 (22-T.mp3)
    if (qNum === 22) {
      return {
        title:`Question ${qNum}`,
        instruction:'22. 들은 것을 고르십시오.',
        image: null,
        audio: '22-T.mp3',
        options:[
          '1 적재',
          '2 직장',
          '3 적정',
          '4 정전'
        ],
        correct: '1'
      };
    }

    // Q23 (23_T.mp3)
    if (qNum === 23) {
      return {
        title:`Question ${qNum}`,
        instruction:'23. 다음을 듣고 들은 내용과 관계있는 그림을 고르십시',
        image: null,
        audio: '23_T.mp3',
        options:[
          { img: 'q23_opt1.PNG', label: '1' },
          { img: 'q23_opt2.PNG', label: '2' },
          { img: 'q23_opt3.PNG', label: '3' },
          { img: 'q23_opt4.PNG', label: '4' }
        ],
        correct: '3'
      };
    }

    // Q24 (24-T.mp3)
    if (qNum === 24) {
      return {
        title:`Question ${qNum}`,
        instruction:'24. 다음을 듣고 들은 내용과 관계있는 그림을 고르십시',
        image: null,
        audio: '24-T.mp3',
        options:[
          { img: 'capture1.PNG', label: '1' },
          { img: 'capture2.PNG', label: '2' },
          { img: 'capture3.PNG', label: '3' },
          { img: 'capture4.PNG', label: '4' }
        ],
        correct: '2'
      };
    }

    // Q25 (25-T.mp3)
    if (qNum === 25) {
      return {
        title:`Question ${qNum}`,
        instruction:'25. 다음을 듣고 들은 내용과 관계있는 그림을 고르십시',
        image: null,
        audio: '25-T.mp3',
        options:[
          { img: 'c11.PNG', label: '1' },
          { img: 'c22.PNG', label: '2' },
          { img: 'c33.PNG', label: '3' },
          { img: 'c44.PNG', label: '4' }
        ],
        correct: '1'
      };
    }

    // Q26 (26-T.mp3)
    if (qNum === 26) {
      return {
        title:`Question ${qNum}`,
        instruction:'26. 다음을 듣고 들은 내용과 관계있는 그림을 고르십시',
        image: null,
        audio: '26-T.mp3',
        options:[
          { img: 'a1.PNG', label: '1' },
          { img: 'a2.PNG', label: '2' },
          { img: 'a3.PNG', label: '3' },
          { img: 'a4.PNG', label: '4' }
        ],
        correct: '1'
      };
    }

    // Q27 (27-T.mp3)
    if (qNum === 27) {
      return {
        title:`Question ${qNum}`,
        instruction:'27. 다음을 듣고 들은 내용과 관계있는 그림을 고르십시',
        image: null,
        audio: '27-T.mp3',
        options:[
          { img: 'a5.PNG', label: '1' },
          { img: 'a6.PNG', label: '2' },
          { img: 'a7.PNG', label: '3' },
          { img: 'a8.PNG', label: '4' }
        ],
        correct: '3'
      };
    }

    // Q28 (28-T.mp3)
    if (qNum === 28) {
      return {
        title:`Question ${qNum}`,
        instruction:'28. 다음을 듣고 들은 내용과 관계있는 그림을 고르십시',
        image: null,
        audio: '28-T.mp3',
        options:[
          { img: 'w1.PNG', label: '1' },
          { img: 'w2.PNG', label: '2' },
          { img: 'w3.PNG', label: '3' },
          { img: 'w4.PNG', label: '4' }
        ],
        correct: '1'
      };
    }

    // Q29..Q33 (sound1..sound5)
    if (qNum === 29) {
      return {
        title:`Question ${qNum}`,
        instruction:'29. 다음을 듣고 질문에 알맞은 대답을 고르십시오.',
        image: null,
        audio: 'sound1.mp3',
        options:[
          '1 그럼요, 법률 교육은 못해요.',
          '2 아니요, 항상 수업을 하고 있어요.',
          '3 아니요, 법률 교육을 받고 있어요.',
          '4 그럼요, 상담을 받고 신청하면 돼요.'
        ],
        correct:'4'
      };
    }
    if (qNum === 30) {
      return {
        title:`Question ${qNum}`,
        instruction:'30. 다음을 듣고 질문에 알맞은 대답을 고르십시오.',
        image: null,
        audio: 'sound2.mp3',
        options:[
          '1 네, 교육 일정을 좀 알려 주세요.',
          '2 네, 취업이 빨리 돼야 할 텐데요.',
          '3 아니요, 다음 주라고 들었는데요.',
          '4 아니요, 교육 내용이 어려웠어요.'
        ],
        correct:'3'
      };
    }
    if (qNum === 31) {
      return {
        title:`Question ${qNum}`,
        instruction:'31. 다음을 듣고 질문에 알맞은 대답을 고르십시오.',
        image: null,
        audio: 'sound3.mp3',
        options:[
          '1 집에서 드세요.',
          '2 감기약을 드세요.',
          '3 밥을 먹은 후에 드세요.',
          '4 따뜻한 물과 같이 드세요'
        ],
        correct:'3'
      };
    }
    if (qNum === 32) {
      return {
        title:`Question ${qNum}`,
        instruction:'32. 다음을 듣고 질문에 알맞은 대답을 고르십시오.',
        image: null,
        audio: 'sound4.mp3',
        options:[
          '1 3층 회의실에서 한다고 들었어요.',
          '2 교육은 누구나 받을 수 있어요.',
          '3 성희롱 예방 교육은 두 시에 있어요.',
          '4 성희롱 예방 교육은 꼭 들어야 돼요'
        ],
        correct:'1'
      };
    }
    if (qNum === 33) {
      return {
        title:`Question ${qNum}`,
        instruction:'33. 다음을 듣고 이어지는 말을 고르십시오.',
        image: null,
        audio: 'sound5.mp3',
        options:[
          '1 비상구가 어디인지 가르쳐 주세요.',
          '2 불이 나자마자 밖으로 대피했어요.',
          '3 소화기가 있어서 빨리 불을 껐어요.',
          '4 비상구 위치를 잘 기억해 놓을게요.'
        ],
        correct:'4'
      };
    }

    // Q34 (34-T.mp3)
    if (qNum === 34) {
      return {
        title: `Question ${qNum}`,
        instruction: '34. 다음을 듣고 들은 내용과 관계있는 그림을 고르십시',
        image: null,
        audio: '34-T.mp3',
        options: [
          { img: 'Z1.PNG', label: '1' },
          { img: 'Z2.PNG', label: '2' },
          { img: 'Z3.PNG', label: '3' },
          { img: 'Z4.PNG', label: '4' }
        ],
        correct: '1'
      };
    }

    // Q35 (new)
    if (qNum === 35) {
      return {
        title: `Question ${qNum}`,
        instruction: '35. 다음을 듣고 들은 내용과 관계있는 그림을 고르십시',
        image: null,
        audio: '35-T.mp3',
        options: [
          { img: 'S1.PNG', label: '1' },
          { img: 'S2.PNG', label: '2' }, // correct
          { img: 'S3.PNG', label: '3' },
          { img: 'S4.PNG', label: '4' }
        ],
        correct: '2'
      };
    }
    // Q36 (existing listening)
    if (qNum === 36) {
      return {
        title: `Question ${qNum}`,
        instruction: '36. 다음을 듣고 들은 내용과 관계있는 그림을 고르십시',
        image: null,
        audio: '36-T.mp3',
        options: [
          { img: 'E1.PNG', label: '1' },
          { img: 'E2.PNG', label: '2' },
          { img: 'E3.PNG', label: '3' },
          { img: 'E4.PNG', label: '4' }
        ],
        correct: '3'
      };
    }

    // ------ Q37 (ADDED): both image and audio (sound6.mp3), correct = 4 ------
    if (qNum === 37) {
      return {
        title: `Question ${qNum}`,
        instruction: '37. 다음을 보고 질문에 알맞은 대답을 고르십시오.',
        image: 'X1.PNG',       // visual shown
        audio: 'sound6.mp3',   // soundtrack added
        options: [
          '1 시계 아래에 있습니다.',
          '2 가방 안에 있습니다.',
          '3 의자 밑에 있습니다.',
          '4 서류 옆에 있습니다.'
        ],
        correct: '4'
      };
    }
    if (qNum === 38) {
      return {
        title: `Question ${qNum}`,
        instruction: '38. 남자가 이곳에 온 이유는 무엇입니까?',
        image: null,
        audio: '38-T.mp3',
        options: [
          '1 노트북 수리를 맡기려고',
          '2 지하철 표를 구입하려고',
          '3 잃어버린 가방을 찾으려고',
          '4 내려야 할 역을 물어보려고'
        ],
        correct: '3'
      };
    }
    if (qNum === 39) {
      return {
        title: `Question ${qNum}`,
        instruction: '39. 점심시간 전까지 포장 작업을 끝내야 하는 이유는 무엇입니까?',
        image: null,
        audio: '39-T.mp3',
        options: [
          '1 작업 시간이 많이 걸려서',
          '2 포장할 물건이 너무 많아서',
          '3 오후에 라벨을 붙여야 해서',
          '4 오후에 제품을 출고해야 해서'
        ],
        correct: '4'
      };
    }
    if (qNum === 40) {
      return {
        title: `Question ${qNum}`,
        instruction: '40. 다음 중 들은 내용과 같은 것은 무엇입니까?',
        image: null,
        audio: '40-T.mp3',
        options: [
          '1 남자는 여자와 같은 공장에서 일합니다.',
          '2 남자는 아직 공장장님을 못 만났습니다.',
          '3 남자는 새 회사 사람들이 마음에 듭니다.',
          '4 남자는 이전 공장에서와 같은 일을 합'
        ],
        correct: '3'
      };
    }
    return { title:`Question ${qNum}`, instruction:`Question ${qNum}`, image:null, options:['A','B','C','D'] };
  }
  // ---- end getQuestionData ----

  let currentQuestionNumber = 1;

  // open question view
  function openQuestion(qNum){
    currentQuestionNumber = qNum;
    const data = getQuestionData(qNum);
    if (questionViewTitle) questionViewTitle.textContent = `Question ${qNum}`;
    if (qInstruction) qInstruction.textContent = data.instruction || '';

    // reset media area
    if (qImage) { qImage.style.display = 'none'; qImage.src = ''; qImage.removeAttribute('data-src'); }
    if (audioIcon) audioIcon.style.display = 'none';
    qAudio.pause();
    qAudio.src = '';
    if (audioPlayBtn) { audioPlayBtn.setAttribute('aria-pressed','false'); audioPlayBtn.textContent = '►'; }
    if (audioStatus) audioStatus.textContent = '';

    // show image if present
    if (data.image && qImage) {
      qImage.src = data.image;
      qImage.style.display = 'block';
      qImage.setAttribute('data-src', data.image);
    }

    // show audio if present (note: now independent from image)
    if (data.audio && audioIcon && qAudio) {
      audioIcon.style.display = 'flex';
      qAudio.src = data.audio;
      qAudio.load();
      audioStatus.textContent = 'Ready';

      // ensure thumbnail shows (user wanted first sound track thumb on left)
      if (audioThumbImg) {
        audioThumbImg.src = 'Capture.PNG';
        audioThumbImg.alt = 'audio thumb';
      }

      // initialize play count for this file
      const filename = qAudio.src.split('/').pop();
      audioPlayCounts[filename] = audioPlayCounts[filename] || 0;
      updateAudioButtonState(filename);
    }

    // options
    if (qOptions){
      qOptions.innerHTML = '';
      data.options.forEach((optText, idx)=>{
        const optNum = String(idx+1);
        const btn = document.createElement('button');
        btn.className = 'opt-btn'; btn.dataset.opt = optNum;

        // render text or image option
        if (typeof optText === 'string') {
          btn.innerHTML = optText;
        } else if (typeof optText === 'object' && optText.img) {
          const imgEl = document.createElement('img');
          imgEl.className = 'option-img';
          imgEl.src = optText.img;
          imgEl.alt = `Option ${optNum}`;
          imgEl.style.maxWidth = '100%';
          imgEl.style.height = 'auto';
          btn.appendChild(imgEl);
        } else {
          btn.innerHTML = optText + '';
        }

        // restore selection from in-memory only (note: not auto-select)
        const existing = answersMap[keyFor(qNum)];
        if (existing && existing === optNum) btn.classList.add('selected');

        btn.addEventListener('click', ()=>{
          answersMap[keyFor(qNum)] = optNum;
          answeredSet.add(keyFor(qNum));
          qOptions.querySelectorAll('.opt-btn').forEach(s=>s.classList.remove('selected'));
          btn.classList.add('selected');
          const palEl = document.querySelector(`.q-item[data-q="${keyFor(qNum)}"]`);
          if (palEl) palEl.classList.add('answered');
        });
        qOptions.appendChild(btn);
      });
    }

    if (questionViewCard) questionViewCard.hidden = false;
    if (examCard) examCard.hidden = true;
    window.scrollTo({ top:0, behavior:'smooth' });
  }

  // update audio play button state depending on play count (max 2)
  function updateAudioButtonState(audioFile) {
    const count = audioPlayCounts[audioFile] || 0;
    if (!audioPlayBtn) return;
    if (count >= 2) {
      audioPlayBtn.disabled = true;
      audioStatus.textContent = 'Disabled';
      audioPlayBtn.setAttribute('aria-pressed','false');
      audioPlayBtn.textContent = '►';
    } else {
      audioPlayBtn.disabled = false;
    }
  }

  // audio control
  if (audioPlayBtn) {
    audioPlayBtn.addEventListener('click', () => {
      if (!qAudio.src) return;
      if (audioPlayBtn.disabled) return;

      const src = qAudio.src.split('/').pop();

      if (qAudio.paused) {
        const used = audioPlayCounts[src] || 0;
        if (used >= 2) {
          updateAudioButtonState(src);
          return;
        }
        qAudio.volume = parseFloat(volumeRange.value || '1');
        qAudio.play();
        audioPlayCounts[src] = (audioPlayCounts[src] || 0) + 1;
        updateAudioButtonState(src);
        audioPlayBtn.setAttribute('aria-pressed','true');
        audioPlayBtn.textContent = '❚❚';
        audioStatus.textContent = `Playing (${audioPlayCounts[src]}/2)`;
      } else {
        qAudio.pause();
        audioPlayBtn.setAttribute('aria-pressed','false');
        audioPlayBtn.textContent = '►';
        audioStatus.textContent = 'Paused';
      }
    });
  }

  qAudio.addEventListener('ended', () => {
    const src = qAudio.src.split('/').pop();
    if (audioPlayBtn) audioPlayBtn.setAttribute('aria-pressed','false');
    if (audioPlayBtn) audioPlayBtn.textContent = '►';
    const used = audioPlayCounts[src] || 0;
    if (audioStatus) audioStatus.textContent = used >= 2 ? 'Disabled' : 'Ended';
    updateAudioButtonState(src);
  });

  // image click => open modal (lightbox)
  if (qImage) {
    qImage.addEventListener('click', () => {
      const src = qImage.getAttribute('data-src') || qImage.src;
      if (!src) return;
      modalImg.src = src;
      imgModal.setAttribute('aria-hidden','false');
    });
  }

  // close modal on click anywhere
  imgModal.addEventListener('click', () => {
    imgModal.setAttribute('aria-hidden','true');
    modalImg.src = '';
  });

  // navigation
  qPrevBtn.addEventListener('click', ()=> { let n = currentQuestionNumber; if(n>1) n--; openQuestion(n); });
  qNextBtn.addEventListener('click', ()=> { let n = currentQuestionNumber; if(n<LISTENING_END) n++; openQuestion(n); });
  allQBtn.addEventListener('click', ()=> { if(questionViewCard) questionViewCard.hidden=true; if(examCard) examCard.hidden=false; window.scrollTo({ top:0, behavior:'smooth' }); });

  function bindPaletteToOpenQuestions(){
    document.querySelectorAll('.q-item').forEach(el=>{
      if (el._openHandler) el.removeEventListener('click', el._openHandler);
      el._openHandler = ()=> { const qnum = parseInt(el.textContent,10); openQuestion(qnum); };
      el.addEventListener('click', el._openHandler);
    });
  }

  examBackBtn.addEventListener('click', ()=> { examCard.hidden = true; startCard.hidden = false; });

  // Replace existing finishExamBtn handler with this new block:
  finishExamBtn.addEventListener('click', ()=> {
    const answeredCount = answeredSet.size;

    if (!confirm(`ඔබ විසින් ප්‍රශ්න ${answeredCount} ක් පිළිතුරු දී ඇත. ඉදිරිපත් කරනවාට අවශ්‍යද?`)) return;

    if (examCard) examCard.hidden = true;
    if (questionViewCard) questionViewCard.hidden = true;

    // build the new overlay / interface
    const overlay = document.createElement('div');
    overlay.className = 'submit-photo-overlay';
    overlay.id = 'submitPhotoOverlay';
    overlay.innerHTML = `
      <div class="spo-panel">
        <div class="spo-image-wrap">
        <img src="aa.jpg" alt="Submit info" class="spo-image"/>
          <div class="spo-text">
            <h2>පිළිතුරු ලබා දුන් පසු, වර්ණ දැක්ම පරීක්ෂණය සිදු කරනු ඇත.
            වර්ණ දැක්ම ප්‍රශ්න 15 න් ප්‍රශ්න 12 ක් අහඹු ලෙස දිස් වනු ඇත.</h2>
            <p>•සෑම ප්‍රශ්නයකට කාලය මිනිත්තු 2 තත්පර 30 ක් වන අතර විසඳා නොමැති ප්‍රශ්න වැරදි ලෙස සලකුණු කරනු ඇත.</p>
            <p>• ප්‍රශ්න 07 කට නිවැරදි පිළිතුරු ලබා දුන් විට පරීක්ෂණය සමත් ලෙස අවසන් වේ</p>
            <p>• ප්‍රශ්න 5 කට වැරදි පිළිතුරු ලබා දුන් විට පරීක්ෂණය අසමත් වේ.</p>
            <p>•විශේෂ කොරියානු පරීක්ෂණය සඳහා වර්ණ දැක්ම පරීක්ෂණය අදාළ නොවේ.</p>
            <div class="spo-actions">
              <button id="spoBackBtn" class="btn-light">පිටවීම</button>
              <button id="spoContinueBtn" class="btn-login">Continue</button>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    // prevent background scroll while overlay is open
    document.body.style.overflow = 'hidden';

    // wire buttons
    document.getElementById('spoBackBtn').addEventListener('click', () => {
      const el = document.getElementById('submitPhotoOverlay');
      if (el) el.remove();
      document.body.style.overflow = '';
      if (examCard) examCard.hidden = false;
    });

    // NEW: on Continue => show Color Test UI (with keypad + timer)
    document.getElementById('spoContinueBtn').addEventListener('click', () => {
      const el = document.getElementById('submitPhotoOverlay');
      if (el) el.remove();
      document.body.style.overflow = '';

      // stop main exam timer
      clearExamEndTime();
      stopTimer();

      // compute exam score now and keep it for summary
      const examScore = computeExamScore(); // number

      // create color test overlay
      openColorTestOverlay(examScore);
    });
  });

  // compute exam score (1..40 questions) — each correct = MARKS_PER_QUESTION
  function computeExamScore(){
    let score = 0;
    for (let q=1; q<=LISTENING_END; q++){
      const k = keyFor(q);
      const ans = answersMap[k];
      if (!ans) continue;
      const data = getQuestionData(q);
      if (!data || typeof data.correct === 'undefined') continue;
      // correct is stored as string like '1','2','3','4'
      if (String(ans) === String(data.correct)) {
        score += MARKS_PER_QUESTION;
      }
    }
    // round to 2 decimals just in case
    return Math.round(score * 100) / 100;
  }

  // Color Test overlay logic
  function openColorTestOverlay(prevExamScore){
    const ctImages = [
      "k1.PNG", "k2.PNG", "k3.PNG", "k4.PNG", "k5.PNG", "k6.PNG",
      "k7.PNG", "k8.PNG", "k9.PNG", "k10.PNG", "k11.PNG", "k12.PNG"
    ];

    // track color test answers: ctScore increments when user presses OK and input is non-empty
    let ctIndex = 0; // start at first image index (0-based)
    let remaining = 150;
    let ctTimerInterval = null;
    let ctScore = 0;
    let ctAnsweredCount = 0;

    // overlay UI
    const overlay = document.createElement('div');
    overlay.className = 'color-test-overlay';
    overlay.id = 'colorTestOverlay';
    overlay.innerHTML = `
      <div class="ct-panel">
        <div class="ct-left">
          <div class="ct-image">
            <img src="${ctImages[0]}" alt="Color test image" id="ctImage" />
          </div>
          <div class="ct-footer" id="ctFooter">1 / ${ctImages.length}</div>
        </div>
        <div class="ct-right">
          <div class="ct-meta">
            <div id="ctCandidate">Candidate: ${candidateId.textContent || '-'}</div>
            <div class="ct-qindex" id="ctQIndex">1 / ${ctImages.length}</div>
          </div>
          <div class="ct-timer" id="ctTimer">2:30</div>
          <input type="text" id="ctInput" class="ct-input" readonly />
          <div class="keypad" id="ctKeypad">
            ${[1,2,3,4,5,6,7,8,9,"C",0,"←"].map(k=>`<button class="key-btn">${k}</button>`).join('')}
          </div>
          <div class="ct-actions">
            <button id="ctSkip" class="ct-btn ct-skip">SKIP</button>
            <button id="ctOk" class="ct-btn ct-ok">OK</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    const ctTimerEl = document.getElementById('ctTimer');
    const ctInput = document.getElementById('ctInput');
    const ctQIndex = document.getElementById('ctQIndex');
    const ctImage = document.getElementById('ctImage');
    const ctFooter = document.getElementById('ctFooter');

    function updateCtTimerDisplay(){
      const m = Math.floor(remaining / 60);
      const s = remaining % 60;
      ctTimerEl.textContent = `${m}:${String(s).padStart(2,'0')}`;
    }

    function startTimer(){
      ctTimerInterval = setInterval(() => {
        remaining--;
        updateCtTimerDisplay();
        if (remaining <= 0) {
          remaining = 0;
          clearInterval(ctTimerInterval);
          // treat as SKIP when time expires for that image
          recordAndNext(false);
        }
      }, 1000);
    }

    updateCtTimerDisplay();
    startTimer();

    // keypad
    document.getElementById('ctKeypad').addEventListener('click', (e) => {
      if (!e.target.classList.contains('key-btn')) return;
      const val = e.target.textContent.trim();
      if (val === 'C') ctInput.value = '';
      else if (val === '←') ctInput.value = ctInput.value.slice(0, -1);
      else if (!isNaN(val)) {
        if (ctInput.value.length < 3) ctInput.value += val;
      }
    });

    // skip / ok handlers use recordAndNext
    document.getElementById('ctSkip').addEventListener('click', () => recordAndNext(false));
    document.getElementById('ctOk').addEventListener('click', () => recordAndNext(true));

    // records current input (if okPressed true and input non-empty => +1)
    function recordAndNext(okPressed){
      clearInterval(ctTimerInterval);
      const val = (ctInput && ctInput.value) ? String(ctInput.value).trim() : '';
      if (okPressed && val !== '') {
        ctScore += COLOR_TEST_MARK;
        ctAnsweredCount++;
      } else {
        // SKIP or empty input => no mark
      }

      // move to next
      ctIndex++;
      if (ctIndex >= ctImages.length) {
        endColorTest(prevExamScore, ctScore, ctAnsweredCount);
        return;
      }
      // update image + counters and reset
      ctImage.src = ctImages[ctIndex];
      ctQIndex.textContent = `${ctIndex+1} / ${ctImages.length}`;
      ctFooter.textContent = `${ctIndex+1} / ${ctImages.length}`;
      ctInput.value = '';
      remaining = 150;
      updateCtTimerDisplay();
      startTimer();
    }

    function endColorTest(examScore, colorScore, colorAnswered){
      clearInterval(ctTimerInterval);
      const el = document.getElementById('colorTestOverlay');
      if (el) el.remove();
      document.body.style.overflow = '';

      // show final summary card in main
      const main = document.querySelector('main.container');
      const finalCard = document.createElement('section');
      finalCard.className = 'card wide';
      // ensure numeric formatting: 2 decimals for exam score
      const examScoreFmt = (typeof examScore === 'number') ? examScore.toFixed(2) : '0.00';
      const colorScoreFmt = (typeof colorScore === 'number') ? colorScore.toString() : '0';
      const total = (Number(examScore) || 0) + (Number(colorScore) || 0);
      finalCard.innerHTML = `
        <div class="card-top" style="background:#2e7d32;">
          <h1>🎉 වර්ණ පරීක්ෂණය අවසන්!</h1>
        </div>
        <div class="card-body" style="text-align:center;">
          <p><strong>Exam Marks (40 Qs × ${MARKS_PER_QUESTION}):</strong> ${examScoreFmt} / ${(READING_COUNT + (LISTENING_END - LISTENING_START + 1)) * MARKS_PER_QUESTION}</p>
          <p><strong>Color Test Marks (12 Qs × ${COLOR_TEST_MARK}):</strong> ${colorScoreFmt} / ${COLOR_TEST_COUNT}</p>
          <p style="font-size:18px;margin-top:10px;"><strong>Total Marks:</strong> ${total} / ${((READING_COUNT + (LISTENING_END - LISTENING_START + 1)) * MARKS_PER_QUESTION) + COLOR_TEST_COUNT}</p>
          <div style="margin-top:16px;">
            <button id="finalExitBtn" class="btn-login">නිම කරන්න</button>
          </div>
        </div>
      `;
      main.appendChild(finalCard);

      document.getElementById('finalExitBtn').addEventListener('click', () => {
        // optionally you can send results to server here
        window.location.reload();
      });
    }
  }


  // show stored candidate id if exists
  const storedId = localStorage.getItem('exam_examinee');
  if (storedId) candidateId.textContent = storedId;

  window.addEventListener('beforeunload', ()=> stopTimer());
});
