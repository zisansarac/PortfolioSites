using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Identity;

namespace Backend.Models;

public class AppUser: IdentityUser<Guid> 
{
   
    
    [MaxLength(100)] 
    public string FullName { get; set; } = default!;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow; 
    
    [MaxLength(500)]
    public string? AvatarUrl { get; set; }
    [MaxLength(1000)]
    public string? Bio { get; set; }
}