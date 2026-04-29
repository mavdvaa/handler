import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 10 }, 
    { duration: '1m', target: 50 },   
    { duration: '30s', target: 0 },   
  ],
};

const BASE_URL = 'http://localhost:3000';

export default function () {

  const randomId = Math.floor(Math.random() * 1000000);
  
  const userPayload = JSON.stringify({
    userId: randomId,
    password: 'password123',
  });

  const params = {
    headers: { 'Content-Type': 'application/json' },
  };

  let res1 = http.post(`${BASE_URL}/users`, userPayload, params);

  check(res1, {
    'user status is 202 or 400': (r) => r.status === 202 || r.status === 400,
  });

  if (res1.status === 202 || res1.status === 400) {

    const shaPayload = JSON.stringify({
      userId: randomId,
      text: 'testString',
      difficulty: 3,
    });

    let res2 = http.post(`${BASE_URL}/sha`, shaPayload, params);

    check(res2, {
      'sha task created (202)': (r) => r.status === 202,
    });

    const triggeredPayload = JSON.stringify({
      userId: randomId,
      difficulty: 2,
    });

    let res3 = http.post(`${BASE_URL}/triggered`, triggeredPayload, params);

    check(res3, {
      'triggered task created (202)': (r) => r.status === 202,
    });
  }

  sleep(1);
}
