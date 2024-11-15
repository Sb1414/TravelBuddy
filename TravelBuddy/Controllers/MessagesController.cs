using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TravelBuddy.Data;
using TravelBuddy.Models;

namespace TravelBuddy.Controllers;

public class MessagesController : Controller
{
    private readonly ApplicationDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;

    public MessagesController(ApplicationDbContext context, UserManager<ApplicationUser> userManager)
    {
        _context = context;
        _userManager = userManager;
    }

    [HttpGet]
    public async Task<IActionResult> Index()
    {
        var currentUser = await _userManager.GetUserAsync(User);
        if (currentUser == null) return RedirectToAction("Login", "Account");

        // Загружаем все сообщения, отправленные или полученные текущим пользователем
        var messages = await _context.Messages
            .Where(m => m.SenderId == currentUser.Id || m.RecipientId == currentUser.Id)
            .Include(m => m.Sender)
            .Include(m => m.Recipient)
            .ToListAsync(); // Загружаем все сообщения на клиентскую сторону

        // Группировка сообщений на стороне клиента
        var conversations = messages
            .GroupBy(m => m.SenderId == currentUser.Id ? m.Recipient : m.Sender)
            .Select(g => new ConversationViewModel
            {
                UserId = g.Key.Id,
                FullName = g.Key.FullName,
                ProfilePictureUrl = g.Key.ProfilePictureUrl,
                LastMessage = g.OrderByDescending(m => m.SentAt).First().Content,
                SentAt = g.OrderByDescending(m => m.SentAt).First().SentAt
            })
            .ToList();

        return View(conversations);
    }


    [Authorize]
    [HttpGet]
    public async Task<IActionResult> Chat(string recipientId)
    {
        var currentUserId = _userManager.GetUserId(User);
        if (string.IsNullOrEmpty(currentUserId))
        {
            return RedirectToAction("Login", "Account");
        }

        if (string.IsNullOrEmpty(recipientId))
        {
            return NotFound();
        }

        var recipient = await _context.Users.FirstOrDefaultAsync(u => u.Id == recipientId);
        if (recipient == null)
        {
            return NotFound();
        }

        // Загружаем только сообщения между текущим пользователем и выбранным получателем
        var messages = await _context.Messages
            .Where(m => (m.SenderId == currentUserId && m.RecipientId == recipientId) ||
                        (m.SenderId == recipientId && m.RecipientId == currentUserId))
            .OrderBy(m => m.SentAt) // Сортируем по времени отправки, чтобы показывать сообщения в хронологическом порядке
            .ToListAsync();

        // Загрузка всех сообщений для текущего пользователя
        var allMessages = await _context.Messages
            .Where(m => m.SenderId == currentUserId || m.RecipientId == currentUserId)
            .Include(m => m.Sender)
            .Include(m => m.Recipient)
            .ToListAsync(); // Загружаем все сообщения на клиентскую сторону

        // Группируем и сортируем данные на стороне клиента
        var conversations = allMessages
            .GroupBy(m => m.SenderId == currentUserId ? m.Recipient : m.Sender)
            .Select(g => new ConversationViewModel
            {
                UserId = g.Key.Id,
                FullName = g.Key.FullName,
                ProfilePictureUrl = g.Key.ProfilePictureUrl,
                LastMessage = g.OrderByDescending(m => m.SentAt).First().Content,
                SentAt = g.OrderByDescending(m => m.SentAt).First().SentAt
            })
            .ToList();

        var chatViewModel = new ChatViewModel
        {
            RecipientId = recipientId,
            RecipientName = recipient.FullName ?? recipient.Email,
            Messages = messages,
            Conversations = conversations,
            CurrentUser = await _userManager.GetUserAsync(User)
        };

        return View(chatViewModel);
    }



    [Authorize]
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> SendMessage(string recipientId, string content)
    {
        var senderId = _userManager.GetUserId(User);
        if (string.IsNullOrEmpty(senderId) || string.IsNullOrEmpty(recipientId) || string.IsNullOrEmpty(content))
        {
            return BadRequest();
        }

        var message = new Message
        {
            SenderId = senderId,
            RecipientId = recipientId,
            Content = content,
            SentAt = DateTime.UtcNow
        };

        _context.Messages.Add(message);
        await _context.SaveChangesAsync();

        return RedirectToAction("Chat", new { recipientId });
    }
}