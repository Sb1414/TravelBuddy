using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using TravelBuddy.Models;

namespace TravelBuddy.Data
{
	public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
	{
		public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
			: base(options)
		{
		}

		// Добавьте DbSet для сообщений
		public DbSet<Message> Messages { get; set; }
		public DbSet<UserRoute> Routes { get; set; }
		public DbSet<RouteStop> RouteStops { get; set; }
		public DbSet<UserRoute> UserRoutes { get; set; }

		protected override void OnModelCreating(ModelBuilder modelBuilder)
		{
			base.OnModelCreating(modelBuilder);

			// Дополнительная настройка модели для Message, если требуется
			modelBuilder.Entity<Message>()
				.HasOne(m => m.Sender)
				.WithMany()
				.HasForeignKey(m => m.SenderId)
				.OnDelete(DeleteBehavior.Restrict);

			modelBuilder.Entity<Message>()
				.HasOne(m => m.Recipient)
				.WithMany()
				.HasForeignKey(m => m.RecipientId)
				.OnDelete(DeleteBehavior.Restrict);
		}
	}
}
