using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using SignOn.Controllers.Filters;
using SignOn.Models.DTOs;
using SignOn.Services;

namespace SignOn.Controllers
{
    [ApiController]
    [Route("[controller]")]
    [Authorize]
    [EnableCors("_corsSpecificOrigins")]
    [ValidateModelFilter]
    public class AuthController : ControllerBase
    {
        private readonly string COOKIE_REFRESH_TOKEN = "auth_refresh_token";
        private readonly ILogger<AuthController> _logger;
        private readonly IUserService _userService;

        public AuthController(ILogger<AuthController> logger, IUserService userService)
        {
            _logger = logger;
            _userService = userService;
        }

        [AllowAnonymous]
        [HttpPost]
        public IActionResult Register([FromBody]RegisterUserDto user)
        {
            var registeredUser = _userService.Register(user.FirstName, user.LastName, user.Email, user.Phone, user.Password);

            if (registeredUser != null)
            {
                SetRefreshTokenCookie(registeredUser.JwtRefreshToken.ToString());

                return Ok(new AuthenticatedUserDto()
                {
                    Jwt = registeredUser.Jwt.Token,
                    JwtExpiry = registeredUser.Jwt.Expires
                });
            }
            else
            {
                return Conflict();
            }
        }

        [AllowAnonymous]
        [HttpPost("authenticate")]
        public IActionResult Authenticate([FromBody]AuthenticateUserDto authenticateUser)
        {
            var user = _userService.Authenticate(authenticateUser.Email, authenticateUser.Password);

            if (user != null)
            {
                SetRefreshTokenCookie(user.JwtRefreshToken.ToString());
                
                return Ok(new AuthenticatedUserDto()
                {
                    Jwt = user.Jwt.Token,
                    JwtExpiry = user.Jwt.Expires
                });
            }
            else
            {
                return Unauthorized();
            }
        }

        [AllowAnonymous]
        [HttpPost("refresh")]
        public IActionResult Refresh()
        {
            var refreshToken = Request.Cookies[COOKIE_REFRESH_TOKEN];

            if (!string.IsNullOrWhiteSpace(refreshToken))
            {
                if(Guid.TryParse(refreshToken, out var token))
                {
                    var refreshedJwt = _userService.Refresh(token);

                    if (refreshedJwt != null)
                    {
                        SetRefreshTokenCookie(refreshedJwt.RefreshToken.ToString());
                        
                        return Ok(new AuthenticatedUserDto()
                        {
                            Jwt = refreshedJwt.Jwt.Token,
                            JwtExpiry = refreshedJwt.Jwt.Expires
                        });
                    }
                    else
                    {
                        Response.Cookies.Delete(COOKIE_REFRESH_TOKEN,
                                            new CookieOptions()
                                            {
                                                Expires = DateTime.Now.AddDays(1),
                                                HttpOnly = true
                                            });

                        return Unauthorized();
                    }
                }
                else
                {
                    Response.Cookies.Delete(COOKIE_REFRESH_TOKEN,
                                            new CookieOptions()
                                            {
                                                Expires = DateTime.Now.AddDays(1),
                                                HttpOnly = true
                                            });

                    return BadRequest("Refresh token badly formatted");
                }
            }
            else
            {
                return Unauthorized();
            }
        }

        [HttpPost("logout")]
        public IActionResult LogOut()
        {
            var userId = GetUserId();
            if (userId.HasValue)
            {
                _userService.LogOut(userId.Value);
                return Ok();
            }
            else
            {
                return Unauthorized();
            }
        }


        [HttpGet]
        public IEnumerable<UserDto> Get()
        {
            return _userService.GetAll().Select(user => new UserDto()
            {
                Id = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
            });
        }

        #region Helper Methods

        private void SetRefreshTokenCookie(string refreshToken)
        {
            Response.Cookies.Append(COOKIE_REFRESH_TOKEN,
                                        refreshToken,
                                        new CookieOptions()
                                        {
                                            Expires = DateTime.Now.AddDays(1),
                                            HttpOnly = true,
                                            Path = "/"
                                        });
        }

        public long? GetUserId()
        {
            var principal = HttpContext.User;
            var userId = principal?.Claims?.FirstOrDefault(claim => claim.Type == ClaimTypes.NameIdentifier).Value;
            if (userId != null)
            {
                return long.Parse(userId);
            }
            else
            {
                return null;
            }
        }

        #endregion Helper Methods
    }
}
