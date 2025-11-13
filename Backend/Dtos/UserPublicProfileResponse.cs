using System;

namespace Backend.Dtos
{
    // Yazar adına tıklayınca dönen DTO (Sadece herkese açık bilgiler)
    public class UserPublicProfileResponse
    {
        public Guid Id { get; set; }
        public string? Email { get; set; }
        public string? FullName { get; set; }
        public string? AvatarUrl { get; set; }
        public string? Bio { get; set; }
    }
}