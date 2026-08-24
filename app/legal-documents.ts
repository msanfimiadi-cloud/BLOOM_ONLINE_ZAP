export const legalDocumentVersion="2026-08-24";

export const legalDocuments={
 offer:{title:"Публичная оферта",subtitle:"Условия подключения салонов и частных специалистов к Bloom Online"},
 terms:{title:"Пользовательское соглашение",subtitle:"Правила использования сервиса онлайн-записи Bloom Online"},
 privacy:{title:"Политика конфиденциальности",subtitle:"Политика обработки и защиты персональных данных"},
 "personal-data-consent":{title:"Согласие на обработку персональных данных",subtitle:"Отдельное согласие пользователя сервиса Bloom Online"},
 cookies:{title:"Политика использования cookies",subtitle:"Порядок использования технических файлов cookie"},
} as const;

export type LegalDocument=keyof typeof legalDocuments;

export function legalOperator(){
 return{
  name:(process.env.LEGAL_OPERATOR_NAME??"").trim()||"ИП Глущенко Анастасия Дмитриевна",
  email:(process.env.LEGAL_CONTACT_EMAIL??"").trim()||"bloomclub.info@mail.ru",
  inn:(process.env.LEGAL_OPERATOR_INN??"").trim()||"541007956565",
  ogrn:(process.env.LEGAL_OPERATOR_OGRN??"").trim()||"323547600049744",
  website:(process.env.PUBLIC_URL??"").trim()||"https://online.bloomclub.ru",
 };
}
