# Sử dụng Ubuntu minimal base image
FROM ubuntu:20.04

# Đặt biến môi trường để tránh yêu cầu tương tác khi cài đặt
ENV DEBIAN_FRONTEND=noninteractive

# Tạo thư mục làm việc trong container
WORKDIR /api

# Cập nhật hệ thống và cài đặt các gói cần thiết
RUN apt-get update -y && apt-get install -y --no-install-recommends \
    bash python3-pip nodejs npm && \
    pip3 install requests python-telegram-bot pytz termcolor psutil && \
    npm install colors set-cookie-parser request axios hpack https commander socks chalk chalk@2 express && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Sao chép toàn bộ nội dung từ thư mục hiện tại vào container
COPY . .

# Cài đặt các phụ thuộc cho Node.js ứng dụng
RUN npm install

# Mở cổng 80
EXPOSE 80

# Tạo script để chạy cả hai lệnh
RUN echo -e "#!/bin/bash\nnode api.js &\npython3 prxscan.py -l list.txt\nwait" > start.sh && chmod +x start.sh

# Lệnh khởi động mặc định
CMD ["bash", "start.sh"]
