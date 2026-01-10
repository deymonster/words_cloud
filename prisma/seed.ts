import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding...')

  // 1. Get or create active poll
  let poll = await prisma.poll.findFirst({ where: { status: 'ACTIVE' } })
  if (!poll) {
    poll = await prisma.poll.create({
      data: {
        question: 'Тестовый вопрос для проверки облака?',
        status: 'ACTIVE',
      },
    })
    console.log('Created new active poll')
  } else {
    console.log('Using existing active poll:', poll.question)
  }

  // 2. Generate test words (Dictionary of various lengths)
  const dictionary = [
    'Слова', 'Облако', 'Визуализация', 'Тестирование', 'Овал', 'Форма', 'Дизайн',
    'Разработка', 'Код', 'Программирование', 'React', 'Next.js', 'TypeScript',
    'Prisma', 'Docker', 'База данных', 'Сервер', 'Клиент', 'Интерфейс', 'Пользователь',
    'Опыт', 'Взаимодействие', 'Красота', 'Стиль', 'Эффект', 'Анимация',
    'Скорость', 'Производительность', 'Масштабируемость', 'Надежность',
    'Безопасность', 'Логика', 'Структура', 'Архитектура', 'Компонент',
    'Функция', 'Переменная', 'Константа', 'Массив', 'Объект', 'Класс',
    'Метод', 'Свойство', 'Событие', 'Обработчик', 'Состояние', 'Эффект',
    'Хук', 'Рендер', 'Дом', 'Дерево', 'Узел', 'Элемент', 'Атрибут',
    'Стиль', 'Класс', 'Идентификатор', 'Селектор', 'Запрос', 'Ответ',
    'Заголовок', 'Тело', 'Статус', 'Ошибка', 'Исключение', 'Отладка',
    'Лог', 'Консоль', 'Терминал', 'Команда', 'Скрипт', 'Файл', 'Папка',
    'Директория', 'Путь', 'Ссылка', 'URL', 'HTTP', 'HTTPS', 'API',
    'REST', 'GraphQL', 'JSON', 'XML', 'YAML', 'CSV', 'SQL', 'NoSQL',
    'Не знаю', 'Возможно', 'Может быть', 'Конечно', 'Безусловно',
    'Вероятно', 'Точно', 'Именно', 'Так и есть', 'Согласен', 'Поддерживаю'
  ]

  // 3. Insert random responses to create volume and frequency variance
  const responsesCount = 150 // Enough to fill the cloud
  
  console.log(`Generating ${responsesCount} responses...`)
  
  for (let i = 0; i < responsesCount; i++) {
    // Pick a random word from dictionary
    // Use weighted random to create frequency differences
    // First 10 words are more frequent
    let word = ''
    const rand = Math.random()
    if (rand > 0.8) {
       word = dictionary[Math.floor(Math.random() * 10)] // Top 10 common
    } else {
       word = dictionary[Math.floor(Math.random() * dictionary.length)]
    }

    await prisma.response.create({
      data: {
        pollId: poll.id,
        name: 'Tester',
        text: word,
      }
    })
  }

  console.log('Seeding finished.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
