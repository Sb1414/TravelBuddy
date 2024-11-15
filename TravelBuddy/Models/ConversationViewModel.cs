namespace TravelBuddy.Models;

public class ConversationViewModel
{
    public string UserId { get; set; } // ID пользователя, с которым ведется диалог
    public string FullName { get; set; } // Имя пользователя
    public string ProfilePictureUrl { get; set; } // Фото профиля
    public string LastMessage { get; set; } // Последнее сообщение в диалоге
    public DateTime SentAt { get; set; } // Время последнего сообщения
}
