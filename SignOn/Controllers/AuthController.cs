using System;
using System.Linq;
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
        private readonly IAuthenticationService _authService;

        public AuthController(ILogger<AuthController> logger, IAuthenticationService authService)
        {
            _logger = logger;
            _authService = authService;
        }

        [AllowAnonymous]
        [HttpPost("business")]
        public IActionResult SignUp([FromBody]SignUpDto user)
        {
            var registeredUser = _authService.SignUp(user.Email, user.Password);

            if (registeredUser != null)
            {
                SetRefreshTokenCookie(registeredUser.JwtRefreshToken.ToString());

                return Ok(new AuthenticatedDto()
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
        public IActionResult SignIn([FromBody]SignInDto authenticateUser)
        {
            var authToken = _authService.SignIn(authenticateUser.Email, authenticateUser.Password);

            if (authToken != null)
            {
                SetRefreshTokenCookie(authToken.JwtRefreshToken.ToString());
                return Ok(new AuthenticatedDto()
                {
                    Jwt = authToken.Jwt.Token,
                    JwtExpiry = authToken.Jwt.Expires
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
                if (Guid.TryParse(refreshToken, out var token))
                {
                    var refreshedJwt = _authService.Refresh(token);

                    if (refreshedJwt != null)
                    {
                        SetRefreshTokenCookie(refreshedJwt.JwtRefreshToken.ToString());
                        return Ok(new AuthenticatedDto()
                        {
                            Jwt = refreshedJwt.Jwt.Token,
                            JwtExpiry = refreshedJwt.Jwt.Expires
                        });
                    }
                    else
                    {
                        Response.Cookies.Delete(COOKIE_REFRESH_TOKEN);
                        return Unauthorized();
                    }
                }
                else
                {
                    Response.Cookies.Delete(COOKIE_REFRESH_TOKEN);
                    return BadRequest("Refresh token badly formatted");
                }
            }
            else
            {
                return Unauthorized();
            }
        }

        [HttpPost("sign-out")]
        public IActionResult SignOut()
        {
            var userId = GetUserId();
            if (userId.HasValue)
            {
                _authService.RevokeRefresh(userId.Value);
                Response.Cookies.Delete(COOKIE_REFRESH_TOKEN);
                return Ok();
            }
            else
            {
                return Unauthorized();
            }
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
            var userId = principal?.Claims?.FirstOrDefault(claim => claim.Type == "nameidentifier")?.Value;
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
