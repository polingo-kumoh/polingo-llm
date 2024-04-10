# Python 3.8이 포함된 공식 Python Docker 이미지를 사용합니다.
FROM python:3.8-slim

# 작업 디렉터리 설정
WORKDIR /app

# 의존성 파일 복사
COPY requirements.txt .

RUN  pip install --upgrade pip

# 의존성 설치
RUN pip install --no-cache-dir -r requirements.txt

# 애플리케이션 파일 복사
# Docker Compose를 사용하여 볼륨으로 마운트할 예정이므로, COPY 명령은 주석 처리하거나 제거합니다.
# COPY . .

# Gunicorn을 사용하여 애플리케이션 실행
CMD ["gunicorn", "-b", "0.0.0.0:5000", "app:app"]
