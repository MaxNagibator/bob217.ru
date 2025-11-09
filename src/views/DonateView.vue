<script lang="ts" setup></script>

<template>
  <div class="donate">
    <div class="donate-container">
      <h2>
        Поддержки каналов "дот нет помойка", "лучик света", "игровая дрисня", "фильмы с максимчиком"
      </h2>
      <h2>
        Телега тут
        <a href="https://t.me/bobito217">https://t.me/bobito217</a>
      </h2>

      <div class="donate-section">
        <p>Пожертвования можно кидать сюды</p>
        <a class="donate-link" href="https://donate.stream/bob217">
          https://donate.stream/bob217
        </a>
        <img alt="QR код для доната" class="qr-image" src="/img/qr.png" />
      </div>

      <div class="donate-section crypto">
        <p>Криптой сюда</p>
        <div class="crypto-address">0x79373a0523c4fb5917a31c968c190bc3d188641a</div>
        <img alt="USDC QR код" class="qr-image" src="/img/usdc.png" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.donate {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
}

.donate-container {
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
}

.donate-container h2 {
  margin-bottom: 1.5rem;
  text-align: center;
}

.donate-container h2 a {
  color: #00bcd4;
}

.donate-section {
  margin-top: 2.5rem;
  padding: 2rem;
  text-align: center;
  border-radius: 10px;
  background-color: #333;
}

.donate-section p {
  font-size: 1rem;
  margin-bottom: 1rem;
}

.donate-link {
  font-size: 1rem;
  display: inline-block;
  margin-bottom: 1.5rem;
  text-decoration: underline;
  color: #00bcd4;
}

.donate-link:hover {
  color: #ffcc00;
}

.qr-image {
  display: block;
  max-width: 100%;
  height: auto;
  margin: 1.5rem auto 0;
  border-radius: 10px;
}

.crypto-address {
  font-family: monospace;
  font-size: 0.875rem;
  margin: 1rem 0;
  padding: 1rem;
  word-break: break-all;
  color: #ffcc00;
  border-radius: 10px;
  background-color: #444;
}

@media (max-width: 768px) {
  .donate-container {
    max-width: 100%;
  }

  .donate-container h2 {
    font-size: 1.25rem;
  }
}
</style>
