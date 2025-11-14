<script lang="ts" setup></script>

<template>
  <div class="resume">
    <h2>BobGroup. Работаем на себя. что вспомнилось:</h2>
    <p class="note">Если вы это смотрите, то сорян, на фронтенд деняк не хватило</p>

    <div class="resume-item">
      <h4>11. Ведущий канала ".net помойка"</h4>
      <p>
        Стримлю мелкое программирование для успокоения души и просвещения масс.
        <br />
        <a href="http://bob217.ru">тут поделки со стрима</a>
        <br />
        <a href="https://www.youtube.com/@bobito217">https://www.youtube.com/@bobito217</a>
        <br />
        <a href="https://www.twitch.tv/bobito217">https://www.twitch.tv/bobito217</a>
      </p>
    </div>

    <div class="resume-item">
      <h4>1. Гексапод (winform, opengl)</h4>
      <p>
        первый крупный заказ, запомнился, рисуем 2 круглых платформы, соединённые 6 втулками.
        <br />
        Одна платформа неподвижна, другая перемещается в заданные координаты и вращается по углам
        Эйлера, за указанный промежуток времени, таймлайн, куча полей для данных, отрисовка.
        <br />
        <a href="https://github.com/MaxNagibator/gusev">github</a>
      </p>
    </div>

    <div class="resume-item">
      <h4>2. Репетиторство</h4>
      <p>
        было время, обучал молодых, основам программирования, мелочь, ничего серьёзного.
        <br />
        <a href="http://tomsk.repetitors.info/comments.php?p=GritsinaMA">link</a>
      </p>
    </div>

    <div class="resume-item">
      <h4>3. Расчёт стоимости электроэнергии</h4>
      <p>
        winform, уже и не помню точно, в эксельке контора одна считала, а потом начала на винформах
        переписывать, помог ей вобщем. Ничего специфического
        <br />
        <a href="https://github.com/MaxNagibator/calc-energy">github</a>
      </p>
    </div>

    <div class="resume-item">
      <h4>4. Браузерная игра "Шахтёр"</h4>
      <p>
        для души. познаём angular, серверная часть на c# wcf.
        <br />
        Рабочие добывают, воинов нанимаем, грабим другие деревни, шмотки выпадают, одеваем героя,
        делаем улучшения, строим домики.
        <br />
        <a href="https://vk.com/bob217miner">vk</a>
        <a href="https://www.dropbox.com/s/9bt66d1zbgfqr26/m1.png?dl=0">screen</a>
        <a href="https://www.dropbox.com/s/435avjywsxehkaz/m2.png?dl=0">screen</a>
      </p>
    </div>

    <div class="resume-item">
      <h4>5. Расходы</h4>
      <p>
        для души. wcf, mvc, android, бюджетный инструмент для записи расходов.
        <br />
        <a href="https://vk.com/bob217money">vk</a>
        <a href="https://www.dropbox.com/s/mh6zoor6pu97sgf/f2.png?dl=0">screen</a>
        <a href="https://www.dropbox.com/s/e6uhw2ov5utlrjn/f1.png?dl=0">screen</a>
      </p>
    </div>

    <div class="resume-item">
      <h4>6. ФИС</h4>
      <p>
        ФИС - из последнего, помощь товарищам из Казахстана. Информационная система для регистрации
        фармацевтического барахла(таблетки и тд.) с кучей функционала. MVC +kendo, angular.
        <br />
        Моё участие(делаем функционал):
        <br />
        Настройка времени приёма на внутреннем портале, и запись на приём на внешнем.
        <br />
        Один из этапов экспертизы (Экспертный совет), реализация логики, печатный формы(stimulsoft
        reports).
        <br />
        Логирование обращений к сервисной части (всех подряд и индивидуальное красивое).
        <br />
        Механизм ролей прав доступа.
        <br />
        Что то ещё по мелочам.
      </p>
    </div>

    <div class="resume-item">
      <h4>7. Электронный журнал</h4>
      <p>
        Маленький проект на винформ, сдача и снятие объектов с охраны.
        <br />
        <a href="https://www.dropbox.com/s/z4a1oec1cjnyjb8/fsb.png?dl=0">screen</a>
      </p>
    </div>

    <div class="resume-item">
      <h4>8. Шахматишки</h4>
      <p>
        Это должно было быть моё портфолио, но в итоге пусть будет демонстрацией того, что чуток
        умею писать плагины и в нугетсы заливать сборки.
        <br />
        <a href="http://chess.bob217.ru/">http://chess.bob217.ru/</a>
        <br />
        <a href="https://github.com/MaxNagibator/chess">https://github.com/MaxNagibator/chess</a>
      </p>
    </div>

    <div class="resume-item">
      <h4>9. Инстамодели</h4>
      <p>
        Простая консольная штука на .net core, которая логинится(черех хитрый парсинг страницы) и
        скачивает фотографии людей из инстаграмма, по тегам или локации. Ну тут без ссылок и
        картинок.
      </p>
    </div>

    <div class="resume-item">
      <h4>10. Департамент недвижимости москвы</h4>
      <p>
        Поработал тут два месяца на полноценную занятость. Ну это печальный опыт легаси, но чтото
        полезное всё жи сделал. Сложно делать фичи, когда локально не все проекты запускаются, а
        разбираться как их запустить не дают, да и сами не знают :)
      </p>
    </div>
  </div>
</template>

<style scoped>
.resume {
  padding: 2rem;
}

.note {
  margin-bottom: 2rem;
  color: #ccc;
}

.resume-item {
  margin-bottom: 2rem;
  padding: 1rem;
  border-radius: 10px;
  background-color: #333;
}

.resume-item h4 {
  margin-bottom: 0.5rem;
  padding-bottom: 0;
  color: #ffcc00;
}

.resume-item p {
  line-height: 1.6;
  margin: 0;
  color: #ccc;
}

.resume-item a {
  margin-right: 0.5rem;
}
</style>
