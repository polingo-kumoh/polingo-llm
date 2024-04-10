FROM nvidia/cuda:10.2-runtime-ubuntu18.04

RUN apt-get update && apt-cache madison python3-pip

RUN apt-get install -y software-properties-common
RUN add-apt-repository ppa:deadsnakes/ppa
RUN apt-get install -y python3.8 python3-pip
RUN apt-get install -y libpython3.8-dev

RUN rm /usr/bin/python3 && ln -s /usr/bin/python3.8 /usr/bin/python3
RUN python3 --version
RUN pip3 --version
RUN python3 -m pip install --upgrade pip

ENV NVIDIA_VISIBLE_DEVICES all
ENV NVIDIA_DRIVER_CAPABILITIES compute,utility

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
