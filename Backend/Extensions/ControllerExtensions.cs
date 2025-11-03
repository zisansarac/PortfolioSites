using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Extensions;

public static class ControllerExtensions
{
    public static Guid GetUserId(this ControllerBase controller)
    {
        var userId = controller.User.FindFirstValue(ClaimTypes.NameIdentifier);


        if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var result))
        {
            throw new Exception("Oturum sahibinin geçerli GUID ID bilgisi token'da bulunamadı.");
        }

        return result;
    }
}