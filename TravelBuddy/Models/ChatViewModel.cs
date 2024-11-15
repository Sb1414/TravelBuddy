namespace TravelBuddy.Models;

public class ChatViewModel
{
    public string RecipientId { get; set; }
    public string RecipientName { get; set; }
    public List<Message> Messages { get; set; }

    // Новое свойство для списка бесед
    public List<ConversationViewModel> Conversations { get; set; }

    // Новое свойство для текущего пользователя
    public ApplicationUser CurrentUser { get; set; }
}