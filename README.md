# Todo App

심플한 UI의 Todo List 앱입니다. TODO 목록을 추가, 수정, 삭제할 수 있습니다.

## 기술 스택

- Frontend: React 18 + Nginx
- Backend: FastAPI (Python 3.12)
- Container: Docker (단일 이미지, supervisord로 nginx + uvicorn 실행)
- CI/CD: GitHub Actions → ECR → ArgoCD

## 프로젝트 구조

```
todo-app-repository/
├── Dockerfile         # 단일 이미지 (frontend build + backend + nginx + supervisord)
├── supervisord.conf   # nginx + uvicorn 프로세스 관리
├── frontend/          # React 앱 + Nginx reverse proxy
│   ├── src/
│   ├── nginx.conf
│   └── package.json
├── backend/           # FastAPI 서버
│   ├── main.py
│   └── requirements.txt
└── .github/workflows/
    └── ci.yaml        # ECR 빌드/푸시 + Manifest 업데이트
```

## 로컬 실행

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm start
```
브라우저에서 http://localhost:3000 접속 (API는 proxy 설정으로 :8000으로 전달)

## CI/CD 파이프라인

main 브랜치에 push하면 GitHub Actions가 자동으로:
1. 단일 Docker 이미지 빌드 (frontend build → nginx + backend)
2. ECR에 푸시 (태그: commit SHA 앞 8자리)
3. `todo-manifest-repository`의 deployment.yaml 이미지 태그 업데이트
4. ArgoCD가 변경 감지 후 자동 배포 (Sync)

## GitHub 설정 필요 사항

### Repository Variables

| 변수명 | 설명 | 예시 |
|--------|------|------|
| `ECR_REGISTRY` | ECR 레지스트리 URI | `123456789012.dkr.ecr.us-west-2.amazonaws.com` |
| `AWS_ROLE_ARN` | GitHub OIDC용 IAM Role ARN | `arn:aws:iam::123456789012:role/github-actions-ecr-role` |
| `AWS_REGION` | AWS 리전 | `us-west-2` |
| `INGRESS_SECURITY_GROUP` | ALB Ingress에 적용할 Security Group ID | `sg-0123456789abcdef0` |

### Repository Secrets

| 시크릿명 | 설명 |
|----------|------|
| `MANIFEST_PAT` | `todo-manifest-repository` 쓰기 권한이 있는 GitHub PAT |

### ECR 레포지토리

다음 ECR 레포지토리가 필요합니다:
- `todo-app`

### GitHub OIDC IAM Role

GitHub Actions에서 ECR에 접근하기 위한 IAM Role이 필요합니다.
Trust policy에 GitHub OIDC provider를 설정하고, ECR push 권한을 부여하세요.

## API 엔드포인트

| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/health` | 헬스체크 |
| GET | `/api/todos` | 전체 목록 조회 |
| POST | `/api/todos` | 새 Todo 생성 (`{"title": "..."}`) |
| PUT | `/api/todos/{id}` | Todo 수정 (`{"title": "...", "completed": true}`) |
| DELETE | `/api/todos/{id}` | Todo 삭제 |
