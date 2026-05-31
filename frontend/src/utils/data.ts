export interface Philosopher {
  id: string;
  name: string;
  category: string;
  quote: string;
  core: string;
  imageUrl: string;
}

export const PHILOSOPHERS: Philosopher[] = [
  {
    id: "socrates",
    name: "Socrates",
    category: "PHƯƠNG PHÁP SOCRATIC",
    quote: "\"Tôi không thể dạy ai bất cứ điều gì. Tôi chỉ có thể khiến họ suy nghĩ.\"",
    core: "Nghịch lý & Vấn đáp",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBDOOGz8SDcbkZ0xdbL4500wOXdTsapgvoz9dp4qUX5LiOsgoWCaWnc0gAsgBlEHgtdX29vylehAmIkfWcVMZlfywe3G9XcamFwEqSQNY1PtSPRZvoTsf3IXPm62AsBTXHaICwQ1htWu7CiO_tOIr3PCTxTXEQwytjRVd-67rlMgH9eMZf-pFc8fesCXF50OLGdPDAXN1Vd7UhVROkKrT6542t5q_COXxMQUeZvjRcNlMn67F0TG9BV4T1MdS33ePZWFJ77CMgEl-4"
  },
  {
    id: "plato",
    name: "Plato",
    category: "CHỦ NGHĨA DUY TÂM",
    quote: "\"Thực tại được tạo ra bởi tâm trí, chúng ta có thể thay đổi thực tại bằng cách thay đổi tâm trí mình.\"",
    core: "Thuyết Ý niệm",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuB32fphv4sdXNTaW6G7_VaLxnJCIHut4xrtHVArVfyEEWMsd9lFXsyPVqFK_eQq8p5H_Nqqnfw5CZMcQcJeWpHBuwWevYYWokB5vbCT8iHcpdE4jkn1V8lz6zGTe7O85wormsfg3ui8fJCZOR-GSAvtr3VMNGQtlEGhYwVjTnrtuGqliqe5-VOQ9eBS3CDbUZ7tc0GOqKLgXnttcmUduYVOhbpgCDglHsaIcg-EMuHzQwvh0bKio_XLGJfYfkfE-BE-AN0VA3oIF8M"
  },
  {
    id: "marcus_aurelius",
    name: "Marcus Aurelius",
    category: "CHỦ NGHĨA KHẮC KỶ",
    quote: "\"Hạnh phúc của cuộc đời bạn phụ thuộc vào chất lượng những suy nghĩ của bạn.\"",
    core: "Thành trì Nội tâm",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAnPCcy7k8wqp0XBlNsgUf8gCHIkq4MzBDFPpJU4rq-_47wDDn7UgVLrtTutdmaoExeyzN5vStvledj_0ijgsN_NwjCgQLMQTtoTGq9rAB3MNJdv99Ez1qvNkrVcOswTX6WiQQPINen1yw9ifpBadub_HFq1jXOzndBQX7bHJ8I8BHdsDfVlKLruT5vfcAJ3v7VucLimUyFyN4ZOxYfeVl50YN9jInOJMudEQxGhNEt0hidBnDw7bKmjq8qXWZMTkQa_mYz2Y-HIJA"
  },
  {
    id: "nietzsche",
    name: "Nietzsche",
    category: "CHỦ NGHĨA HIỆN SINH",
    quote: "\"Người có lý do để sống có thể chịu đựng hầu như bất cứ điều gì.\"",
    core: "Ý chí Hùng mạnh",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuA1dQFjjPR-D-ewH0mQ07hwrg8e_s9lR96Fcgho5bFGAB-Akgh5xTY2PN1-k0ZxwXNPg6KJIQGEQGLAHIAmTiXpt4p6HzTtyvdUeDKRqsK7oFRmw6WWM9aqs_JxxSeATCo0gCmPpbxqL5rktHIqAbJdgiCPxOqD-XFDWOLzvKIYtHCXBuFMLvaHIHaMmXoFcfm88BjdUR2vugSRHf2tiAl7bI1MFwk5DGHC8g8DgaTX3IVYMCqgrEXnHxO0PbhbtGws2h9Aczin-7k"
  }
];
