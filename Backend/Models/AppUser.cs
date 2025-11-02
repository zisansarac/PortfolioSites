using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Identity;

namespace Backend.Models;

public class AppUser: IdentityUser<Guid> 
{
   
    
    [MaxLength(100)] 
    public string FullName { get; set; } = default!;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow; 
}