using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TravelBuddy.Models;

public class Message
{
    [Key]
    public int Id { get; set; }

    [Required]
    public string SenderId { get; set; }

    [Required]
    public string RecipientId { get; set; }

    [Required]
    [StringLength(500)]
    public string Content { get; set; }

    public DateTime SentAt { get; set; } = DateTime.Now;

    [ForeignKey("SenderId")]
    public virtual ApplicationUser Sender { get; set; }

    [ForeignKey("RecipientId")]
    public virtual ApplicationUser Recipient { get; set; }
}