using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Backend.Dtos;
using Backend.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

namespace Backend.Controllers;

[ApiController]

[Route("api/auth")]


public class AuthController: ControllerBase
{
    private readonly UserManager<AppUser> _userManager;
    private readonly SignInManager<AppUser> _signInManager;
    private readonly IConfiguration _config;

    public AuthController(UserManager<AppUser> userManager, SignInManager<AppUser> signInManager, IConfiguration config)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _config = config;

    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest dto)
    {
       
        var exists = await _userManager.FindByEmailAsync(dto.Email);
        if (exists is not null)
        {
            return Conflict(new { message = "Bu email zaten kayıtlı." });
        }
        
        var user = new AppUser
        {
            Email = dto.Email,
            UserName = dto.Email,
            FullName = dto.FullName ?? "Kullanıcı", 
            CreatedAt = DateTime.UtcNow 
        };
        
        
        var result = await _userManager.CreateAsync(user, dto.Password);
        if (!result.Succeeded)
        {
            return BadRequest(new { errors = result.Errors.Select(e => e.Description) });
        }

        
        var token = GenerateToken(user);
        return Ok(token);
    }
    
    
    [HttpPost("login")] 
    public async Task<IActionResult> Login([FromBody] LoginRequest dto)
    {
        
        var user = await _userManager.FindByEmailAsync(dto.Email);
        if (user is null)
        {
            return Unauthorized(new { message = "Kullanıcı Bulunamadı"});
        }
        
        var check = await _signInManager.CheckPasswordSignInAsync(user, dto.Password, lockoutOnFailure: false);
        if (!check.Succeeded)
        {
            return Unauthorized(new { message = "E-posta veya şifre hatalı." });
        }
        
        var token = GenerateToken(user);
        return Ok(token);
    }
    
    
    private object GenerateToken(AppUser user)
    {
        var jwt = _config.GetSection("JWTSettings"); 
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt["Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()), 
            new(JwtRegisteredClaimNames.Email, user.Email ?? ""), 
            new (ClaimTypes.NameIdentifier, user.Id.ToString()), 
            new (ClaimTypes.Name, user.FullName ?? user.Email ?? "")
        };

        var expires = DateTime.UtcNow.AddMinutes(double.Parse(jwt["ExpireMinutes"]!));

        var token = new JwtSecurityToken(
            issuer: jwt["Issuer"], 
            audience: jwt["Audience"], 
            claims: claims,
            expires: expires,
            signingCredentials: creds
        );

        return new Backend.Dtos.AuthResponse
        {
            Token = new JwtSecurityTokenHandler().WriteToken(token),
            ExpiresAt = expires,
            Email = user.Email ?? "",
            FullName = user.FullName
        };
    } 
}