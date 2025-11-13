
using System;
using System.Security.Claims;
using Backend.Data;
using Backend.Dtos;
using Backend.Models;
using Backend.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers;

[ApiController]
[Route("api/posts")]

public class PostController : ControllerBase
{
    private readonly AppDbContext _db;
    public PostController(AppDbContext db) => _db = db;

    [HttpGet]
    [AllowAnonymous]

    public async Task<ActionResult<IEnumerable<PostResponse>>> List(
          [FromQuery] int page = 1,
          [FromQuery] int pageSize = 10,
          [FromQuery] string? q = null,
          [FromQuery] string? authorId = null,
          [FromQuery] bool onlyPublished = true
    )
    {

        if (page < 1) page = 1;
        if (pageSize < 1 || pageSize > 100) pageSize = 10;
        var query = _db.BlogPosts.AsQueryable();

        if (onlyPublished)
            query = query.Where(b => b.IsPublished);
        if (!string.IsNullOrWhiteSpace(q))
            query = query.Where(b => b.Title.Contains(q) || b.Content.Contains(q));

        if (!string.IsNullOrWhiteSpace(authorId))
        {
            if (Guid.TryParse(authorId, out var authorGuid))
                query = query.Where(b => b.AuthorId == authorGuid);
            else
                return BadRequest("Invalid authorId format.");
        }

        var items = await query
        .OrderByDescending(b => b.CreatedAt)
        .Skip((page - 1) * pageSize)
        .Take(pageSize)
        .Include(b => b.Author)
        .ToListAsync();

        var result = items.Select(b => new PostResponse
        {
            Id = b.Id,
            Title = b.Title,
            Slug = b.Slug,
            Content = b.Content,
            IsPublished = b.IsPublished,
            CreatedAt = b.CreatedAt,
            UpdatedAt = b.UpdatedAt,
            AuthorId = b.AuthorId.ToString(),
            AuthorEmail = b.Author?.Email,
            AuthorFullName = b.Author?.FullName,
            AuthorAvatarUrl = b.Author?.AvatarUrl
        });
        return Ok(result);

    }

    [HttpGet("{slug}")]
    [AllowAnonymous]
    public async Task<ActionResult<PostResponse>> GetBySlug(string slug)
    {
        var b = await _db.BlogPosts
            .Include(x => x.Author)
            .FirstOrDefaultAsync(x => x.Slug == slug);

        if (b is null) return NotFound();

        if (!b.IsPublished)
        {
            var uid = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (uid is null || !Guid.TryParse(uid, out var uidGuid) || uidGuid != b.AuthorId) return Forbid();
        }

        return Ok(new PostResponse
        {
            Id = b.Id,
            Title = b.Title,
            Slug = b.Slug,
            Content = b.Content,
            IsPublished = b.IsPublished,
            CreatedAt = b.CreatedAt,
            UpdatedAt = b.UpdatedAt,
            AuthorId = b.AuthorId.ToString(),
            AuthorEmail = b.Author?.Email,
            AuthorFullName = b.Author?.FullName,
            AuthorAvatarUrl = b.Author?.AvatarUrl
        });
    }

    [HttpPost]
    [Authorize]
    public async Task<ActionResult<PostResponse>> Create([FromBody] PostCreateRequest dto)
    {
        var uid = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var baseSlug = SlugHelper.ToSlug(dto.Title);
        var slug = baseSlug;
        int i = 2;
        while (await _db.BlogPosts.AnyAsync(x => x.Slug == slug))
        {
            slug = $"{baseSlug}-{i}";
            i++;
        }
        var entity = new Post
        {
            Title = dto.Title,
            Slug = slug,
            Content = dto.Content,
            IsPublished = dto.IsPublished,
            AuthorId = Guid.Parse(uid),
            CreatedAt = DateTime.UtcNow
        };

        _db.BlogPosts.Add(entity);
        await _db.SaveChangesAsync();

        var resp = new PostResponse
        {
            Id = entity.Id,
            Title = entity.Title,
            Slug = entity.Slug,
            Content = entity.Content,
            IsPublished = entity.IsPublished,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt,
            AuthorId = entity.AuthorId.ToString()
        };
        return CreatedAtAction(nameof(GetBySlug), new { slug = entity.Slug }, resp);
    }

    [HttpPut("{id:int}")]
    [Authorize]
    public async Task<IActionResult> Update(int id, [FromBody] PostUpdateRequest dto)
    {
        var uid = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(uid, out var uidGuid)) return Forbid();

        var entity = await _db.BlogPosts.FirstOrDefaultAsync(x => x.Id == id);
        if (entity is null) return NotFound();
        if (entity.AuthorId != uidGuid) return Forbid();

        if (!string.Equals(entity.Title, dto.Title, StringComparison.Ordinal))
        {
            var baseSlug = SlugHelper.ToSlug(dto.Title);
            var slug = baseSlug;
            int i = 2;
            while (await _db.BlogPosts.AnyAsync(x => x.Slug == slug))
            {
                slug = $"{baseSlug}-{i}";
                i++;
            }
            entity.Slug = slug;
            entity.Title = dto.Title;
        }
        else
        {
            entity.Title = dto.Title;
        }

        entity.Content = dto.Content;
        entity.IsPublished = dto.IsPublished;
        entity.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return NoContent();
    }
    [HttpDelete("{id:int}")]
    [Authorize]
    public async Task<IActionResult> Delete(int id)
    {
        var uid = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(uid, out var uidGuid)) return Forbid();

        var entity = await _db.BlogPosts.FirstOrDefaultAsync(x => x.Id == id);
        if (entity is null) return NotFound();
        if (entity.AuthorId != uidGuid) return Forbid();

        _db.BlogPosts.Remove(entity);
        await _db.SaveChangesAsync();
        return NoContent();
    }
    }

