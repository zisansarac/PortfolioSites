using Backend.Dtos;
using Backend.Extensions; 
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;


namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] 
public class UsersController : ControllerBase
{
    private readonly UserManager<AppUser> _userManager;

    public UsersController(UserManager<AppUser> userManager)
    {
        _userManager = userManager;
    }

    
    [HttpGet("me")]
    public async Task<ActionResult<AuthResponse>> GetMe()
    {
        var userIdString = HttpContext.User.FindFirstValue(ClaimTypes.NameIdentifier);
        
        var user = await _userManager.FindByIdAsync(userIdString!);

        if (user is null)
        {
            return NotFound(new { message = "Oturum sahibi bulunamadı." });
        }

        return Ok(new AuthResponse
        {
            Token = "JWT_OK",
            ExpiresAt = DateTime.MaxValue,
            Email = user.Email ?? "",
            FullName = user.FullName,
            AvatarUrl = user.AvatarUrl, 
            Bio = user.Bio
        });
    }


    [HttpPut("me")]
    public async Task<IActionResult> UpdateMe([FromBody] UserUpdateRequest dto)
    {
        
        var userIdString = HttpContext.User.FindFirstValue(ClaimTypes.NameIdentifier);
        
        var user = await _userManager.FindByIdAsync(userIdString!);
        
        if (user is null)
        {
            return NotFound(new { message = "Kullanıcı bulunamadı." });
        }


        if (!string.IsNullOrEmpty(dto.FullName))
        {
            user.FullName = dto.FullName;
        }
        
        if (dto.AvatarUrl is not null)
        {
            user.AvatarUrl = dto.AvatarUrl;
        }

        if (dto.Bio is not null)
        {
            user.Bio = dto.Bio;
        }
        
        var result = await _userManager.UpdateAsync(user);

        if (!result.Succeeded)
        {
            return BadRequest(new { errors = result.Errors.Select(e => e.Description) });
        }

        return NoContent(); // 
    }
}