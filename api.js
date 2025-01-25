# Sử dụng official Ubuntu minimal base image
FROM ubuntu:20.04

# Set environment variables to avoid interactive prompts during installation
ENV DEBIAN_FRONTEND=noninteractive

# Tạo thư mục làm việc
WORKDIR /api

# Update and install required packages
RUN apt update -y && apt install -y --no-install-recommends \
    bash curl git tmux htop speedtest-cli python3-pip zip screen ca-certificates gnupg lsb-release \
    && curl -sL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs docker-ce docker-ce-cli containerd.io \
    && pip3 install requests python-telegram-bot pytz termcolor psutil \
    && npm install colors set-cookie-parser request axios hpack https commander socks chalk chalk@2 \
    && npm install express \
    && apt clean \
    && rm -rf /var/lib/apt/lists/*

# Thêm Docker key và repo (giữ để minh bạch cài đặt Docker)
RUN mkdir -p /etc/apt/keyrings && \
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg && \
    echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | \
    tee /etc/apt/sources.list.d/docker.list > /dev/null

# Copy toàn bộ nội dung từ repository vào container
COPY . .

# Expose port 80
EXPOSE 80

# Build Docker image và chạy container
RUN docker build -t image .
RUN docker run -d -p 80:80 image

# Run tất cả các file cần thiết khi container khởi động
CMD bash -c "node api.js || tail -f /dev/null & python3 prxscan.py -l list.txt || tail -f /dev/null"
