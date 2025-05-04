import { Check } from "lucide-react";

const TargetAudience = () => {
  const audiences = [
    {
      title: "Бизнес-аналитики и руководители",
      benefits: [
        "Быстрый анализ рыночных тенденций",
        "Подготовка отчетов и презентаций",
        "Анализ конкурентной среды",
        "Выявление бизнес-возможностей"
      ],
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      )
    },
    {
      title: "R&D-отделы и инноваторы",
      benefits: [
        "Исследование перспективных технологий",
        "Анализ научных трендов и публикаций",
        "Оценка потенциала инноваций",
        "Поиск новых направлений развития"
      ],
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 11.5V14m0 0v2.5M7 14h2.5M7 14h-2.5" />
          <circle cx="17" cy="17" r="1" />
          <path d="M12 3v5.4a.6.6 0 0 1-.6.6H6.6a.6.6 0 0 1-.6-.6V9" />
          <path d="M9 3h9.4a.6.6 0 0 1 .6.6v13.2" />
        </svg>
      )
    },
    {
      title: "Финансовые и продуктовые команды",
      benefits: [
        "Оценка финансовых показателей",
        "Прогнозирование трендов рынка",
        "Анализ эффективности продуктов",
        "Выявление потребностей клиентов"
      ],
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 12H3m8-8v16m-8-8h18m-9 8h9a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H3a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h9Z" />
        </svg>
      )
    },
    {
      title: "Консультанты и исследователи",
      benefits: [
        "Подготовка аналитических материалов",
        "Обработка больших объемов информации",
        "Выявление неочевидных связей",
        "Создание экспертных заключений"
      ],
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <rect x="9" y="9" width="6" height="6" />
          <path d="M15 2v2" />
          <path d="M15 20v2" />
          <path d="M2 15h2" />
          <path d="M20 15h2" />
        </svg>
      )
    }
  ];

  return (
    <section id="for-whom" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold font-montserrat mb-6">
            Для кого <span className="gradient-text">DuoMind</span>
          </h2>
          <p className="text-lg text-gray-700">
            Наше решение помогает специалистам из различных областей ускорять рабочие процессы и принимать более обоснованные решения
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {audiences.map((audience, index) => (
            <div 
              key={index} 
              className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <div className="text-duomind-purple mb-4">
                {audience.icon}
              </div>
              <h3 className="text-xl font-semibold mb-4">
                {audience.title}
              </h3>
              <ul className="space-y-3">
                {audience.benefits.map((benefit, i) => (
                  <li key={i} className="flex items-start">
                    <span className="text-duomind-purple mr-2 mt-1">
                      <Check className="h-4 w-4" />
                    </span>
                    <span className="text-gray-700 text-sm">
                      {benefit}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TargetAudience;