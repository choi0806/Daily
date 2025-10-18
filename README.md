# Daily Snippet

Daily Snippet은 팀 협업을 위한 일일 작업 추적 도구입니다. 캘린더 형식으로 매일의 작업 내용을 기록하고, 팀별 리더보드를 통해 활동을 추적할 수 있습니다.

## 주요 기능

### 📅 캘린더 뷰
- 월별 캘린더 형식으로 날짜 표시
- 각 날짜를 클릭하여 스니펫 작성 및 확인
- 스니펫이 작성된 날짜는 아바타 표시
- 이전/다음 달 이동 및 오늘로 바로가기

### ✍️ 스니펫 작성
- 날짜별 작업 내용 작성
- 모달 방식으로 편리한 입력
- 작성된 내용 수정 가능

### 🏆 팀 리더보드
- 일간/주간 순위 표시
- 팀별 점수 집계
- 다양한 기업 부서 표시 (예: 삼성 마케팅부서, LG전자 통신부서)

### 👤 사용자 관리
- 로그인/로그아웃 기능
- 사용자 프로필 표시
- 사용자별 맞춤 뷰

## 설치 방법

### 1. 의존성 설치

\`\`\`powershell
npm install
\`\`\`

### 2. 개발 서버 실행

\`\`\`powershell
npm run dev
\`\`\`

브라우저에서 자동으로 http://localhost:3000 이 열립니다.

### 3. 프로덕션 빌드

\`\`\`powershell
npm run build
\`\`\`

빌드된 파일은 `dist` 폴더에 생성됩니다.

### 4. 빌드 미리보기

\`\`\`powershell
npm run preview
\`\`\`

## 기술 스택

- **React 18** - UI 라이브러리
- **Vite** - 빌드 도구
- **CSS3** - 스타일링

## 프로젝트 구조

\`\`\`
Sni/
├── src/
│   ├── components/
│   │   ├── Header.jsx          # 헤더 컴포넌트
│   │   ├── Header.css
│   │   ├── Calendar.jsx        # 캘린더 컴포넌트
│   │   ├── Calendar.css
│   │   ├── Leaderboard.jsx     # 리더보드 컴포넌트
│   │   ├── Leaderboard.css
│   │   ├── SnippetModal.jsx    # 스니펫 모달 컴포넌트
│   │   └── SnippetModal.css
│   ├── App.jsx                 # 메인 앱 컴포넌트
│   ├── App.css
│   ├── main.jsx                # 엔트리 포인트
│   └── index.css
├── index.html
├── vite.config.js
├── package.json
└── README.md
\`\`\`

## 사용 방법

1. **로그인**: 우측 상단의 로그인 버튼을 클릭하여 로그인합니다.

2. **스니펫 작성**: 캘린더에서 원하는 날짜를 클릭하면 모달이 열립니다. 작업 내용을 입력하고 저장 버튼을 클릭합니다.

3. **스니펫 확인**: 이미 작성된 날짜를 클릭하면 저장된 내용을 확인하고 수정할 수 있습니다.

4. **리더보드 확인**: 우측 리더보드에서 일간/주간 순위를 확인합니다. 탭을 클릭하여 전환할 수 있습니다.

5. **로그아웃**: 우측 상단의 로그아웃 버튼을 클릭하여 로그아웃합니다.

## 커스터마이징

### 팀 데이터 수정

`src/components/Leaderboard.jsx` 파일에서 `monthlyData`와 `weeklyData` 배열을 수정하여 팀 정보를 변경할 수 있습니다.

\`\`\`javascript
const monthlyData = [
  { rank: 1, team: '삼성 마케팅부서', score: 435 },
  { rank: 2, team: 'LG전자 통신부서', score: 429 },
  // ...
];
\`\`\`

### 사용자 정보 수정

`src/App.jsx` 파일에서 초기 사용자 정보를 수정할 수 있습니다.

\`\`\`javascript
const [currentUser, setCurrentUser] = useState({
  name: '사용자이름/부서명(전공)',
  isLoggedIn: true
});
\`\`\`

## 향후 개선 사항

- [ ] 백엔드 API 연동
- [ ] 실제 인증 시스템 구현
- [ ] 데이터베이스 연동
- [ ] 실시간 협업 기능
- [ ] 파일 첨부 기능
- [ ] 마크다운 지원
- [ ] 알림 기능

## 라이선스

MIT License
