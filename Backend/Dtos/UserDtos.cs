namespace Backend.Dtos;

public class UserProfileResponse
{
    public Guid Id { get; set; }
    public string Email { get; set; } = default!;
    public string? FullName { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? AvatarUrl { get; set; } 
    public string? Bio { get; set; }
}

public class UpdateUserProfileRequest
{
    public string? FullName { get; set; }
    public string? AvatarUrl { get; set; }
    public string? Bio { get; set; }
    public IFormFile? AvatarFile { get; set; }
}