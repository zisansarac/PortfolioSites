using Backend.Data;
using Backend.Dtos;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Backend.Controllers;

[ApiController]
[Route("api/users")] 
[Authorize]
public class UsersController : ControllerBase
{
    private readonly UserManager<AppUser> _userManager;

    public UsersController(UserManager<AppUser> userManager)
    {
        _userManager = userManager;
    }

    private Guid GetCurrentUserId()
    {
        var idClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.TryParse(idClaim, out var userId) ? userId : Guid.Empty;
    }

 
    [HttpGet("me")]
    public async Task<IActionResult> GetCurrentUserProfile()
    {
        var userId = GetCurrentUserId();
        if (userId == Guid.Empty)
        {
            return Unauthorized(); 
        }

        var user = await _userManager.FindByIdAsync(userId.ToString());
        
        if (user == null)
        {
            return NotFound(new { message = "Kullanıcı bulunamadı." });
        }

        
        var response = new UserProfileResponse
        {
            Id = user.Id,
            Email = user.Email ?? "",
            FullName = user.FullName,
            CreatedAt = user.CreatedAt, 
            AvatarUrl = user.AvatarUrl,
            Bio = user.Bio
        };

        return Ok(response);
    }

    
    [HttpPut("me")]
    public async Task<IActionResult> UpdateCurrentUserProfile([FromBody] UpdateUserProfileRequest request)
    {
        var userId = GetCurrentUserId();
        if (userId == Guid.Empty)
        {
            return Unauthorized();
        }

        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null)
        {
            return NotFound(new { message = "Kullanıcı bulunamadı." });
        }
        
        
        if (request.FullName != null)
        {
            user.FullName = request.FullName;
        }
        
        if (request.AvatarUrl != null) 
        {
            user.AvatarUrl = request.AvatarUrl;
        }
        if (request.Bio != null) 
        {
            user.Bio = request.Bio;
        }
        

        var result = await _userManager.UpdateAsync(user);

        if (!result.Succeeded)
        {
             return BadRequest(new { errors = result.Errors.Select(e => e.Description) });
        }

        return NoContent(); 
    }
}