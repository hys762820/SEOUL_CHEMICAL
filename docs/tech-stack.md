# 기술 스택: 서울케미칼 업무 자동화

- 버전 0.5 · 2026-11-23
- 근거: 프로젝트 명세서 v0.1 (9장 13번 구현 기술에 해당)
- 용도: 초기 스켈레톤 구성. 세부 사항은 변경될 수 있음

| 영역 | 구분 | 기술 | 용도 |
|---|---|---|---|
| 프론트엔드 | 언어 | TypeScript | 타입 검사가 있는 JavaScript |
| | 프레임워크 | Next.js 16 (React) | 화면과 서버 로직을 한 프로젝트로 구성 |
| | 스타일 | Tailwind CSS | 클래스 이름으로 디자인 적용 |
| | UI 부품 | shadcn/ui | 버튼, 표, 폼 |
| | 입력 검증 | Zod | 폼 입력과 외부 API 응답의 형식 검사 |
| | 차트 | Recharts | 단가 추세, 환율 그래프 |
| 백엔드 | 실행 환경 | Node.js | 서버 코드 실행 |
| | 서버 로직 | Next.js 내장 기능 | API와 데이터 처리 |
| | 로그인 | Supabase Auth (`@supabase/ssr`) | 구글 로그인과 허용 목록 |
| | DB 접근 | Supabase 클라이언트 (`@supabase/supabase-js`) | DB 읽기와 쓰기 |
| | 예약 실행 | Vercel Schedules (베타) | 예보 확인, 공고 수집, 정기 보고 |
| | 문서 생성 | PDF 라이브러리 (미정. 후보: `@react-pdf/renderer`) | 팩스 문안, 견적서, 출고지시서 |
| | 외부 서비스 연결 | 어댑터 방식 | 업체 교체 시 어댑터만 변경 |
| 데이터 | 데이터베이스 | Supabase PostgreSQL (서울 리전) | 관계형 DB |
| | 기존 회사 자료 | Google Sheets API | 회사 구글 시트 읽기 |
| | 파일 저장 | Supabase Storage | 견적서, 납품 사진 |
| | 구조 변경 이력 | Supabase CLI | 표 구조 변경 내역을 파일로 관리 |
| 배포 | 호스팅 | Vercel | 앱 실행 |
| | 자동 배포 | GitHub 연동 | 코드를 올리면 배포 |
| | 비밀 값 | Vercel 환경 변수 | API 키 보관 |
| | 주소 | Vercel 기본 도메인 | 이관 시 회사 하위 도메인 연결 |
| 공통 | 버전 관리 | Git + GitHub 공개 저장소 | 코드 이력 관리와 공유 |
| | 테스트 | Vitest | 강설 판단, 발송 승인, 날짜 계산 등 핵심 로직 |
| | 코드 품질 | ESLint + Prettier | 코드 검사와 서식 통일 |
| | 패키지 관리 | npm | 라이브러리 설치 |
