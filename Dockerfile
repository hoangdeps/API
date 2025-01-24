# Sử dụng official Ubuntu minimal base image
FROM ubuntu:20.04

# Tạo thư mục làm việc
WORKDIR /api

# Cập nhật và cài đặt các gói cần thiết
RUN apt update -y && apt-get install -y --no-install-recommends \
    bash \
    curl \
    git \
    htop \
    speedtest-cli \
    python3-pip \
    && curl -sL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && pip3 install \
    requests \
    python-telegram-bot \
    pytz \
    termcolor \
    psutil \
    && npm install \
    colors \
    set-cookie-parser \
    request \
    hpack \
    axios \
    https \
    commander \
    socks \
    chalk \
    chalk@2 \
    express \
    && apt clean && rm -rf /var/lib/apt/lists/*

# Copy toàn bộ nội dung từ repository vào container
COPY . .

# Expose port 80
EXPOSE 80

# Run tất cả các file cần thiết khi container khởi động
CMD bash -c "node api.js || tail -f /dev/null & python3 prxscan.py -l list.txt || tail -f /dev/null"

