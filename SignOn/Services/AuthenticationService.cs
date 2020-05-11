using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using SignOn.Entities;
using SignOn.Models;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Security.Cryptography;

namespace SignOn.Services
{
    public interface IAuthenticationService
    {
        AuthToken SignUp(string email, string password);
        AuthToken SignIn(string username, string password);
        AuthToken Refresh(Guid refreshToken);
        void RevokeRefresh(long userId);
    }

    public class AuthenticationService : IAuthenticationService
    {
        private readonly ILogger<AuthenticationService> _logger;
        private readonly JwtKeys _jwtKeys;
        private static readonly List<User> registered = new List<User>();

        public AuthenticationService(ILogger<AuthenticationService> logger, IOptions<JwtKeys> appSettings)
        {
            _logger = logger;
            _jwtKeys = appSettings.Value;
        }

        public AuthToken SignUp(string email, string password)
        {
            var user = registered.Where(user => user.Email == email).FirstOrDefault();

            if (user == null)
            {
                var newUser = new User()
                {
                    Id = (registered.LastOrDefault() ?? new User()).Id + 1,
                    Email = email,
                    Password = password,
                    Roles = new string[] { AuthRoles.ROLE_RESTAURANT_OWNER },
                    RefreshToken = Guid.NewGuid()
                };

                registered.Add(newUser);

                return new AuthToken()
                {
                    Jwt = CreateJwt(newUser),
                    JwtRefreshToken = newUser.RefreshToken
                };
            }
            else
            {
                return null;
            }
        }
        
        public AuthToken SignIn(string username, string password)
        {
            var user = registered.SingleOrDefault(x => x.Email == username && x.Password == password);

            if (user == null)
            {
                return null;
            }
            else
            {
                user.RefreshToken = Guid.NewGuid();
                return new AuthToken()
                {
                    Jwt = CreateJwt(user),
                    JwtRefreshToken = user.RefreshToken
                };
            }
        }

        public AuthToken Refresh(Guid refreshToken)
        {
            var user = registered.SingleOrDefault(user => user.RefreshToken == refreshToken);
            if (user != null)
            {
                user.RefreshToken = Guid.NewGuid();
                return new AuthToken()
                {
                    Jwt = CreateJwt(user),
                    JwtRefreshToken = user.RefreshToken
                };
            }
            else
            {
                return null;
            }
        }

        public void RevokeRefresh(long userId)
        {
            _logger.LogInformation($"Logging out user, ID: {userId}");
            var user = registered.SingleOrDefault(user => user.Id == userId);
            if (user != null)
            {
                user.RefreshToken = Guid.NewGuid(); //create a new un-guessable token - null could be guessable
            }
            else
            {
                _logger.LogError($"Cannot log out user, ID not found: {userId}");
            }
        }

        #region Helper Methods

        private Jwt CreateJwt(User user)
        {
            using RSA privateRsa = RSA.Create();
            privateRsa.FromXmlString(_jwtKeys.PrivateKey);
            var privateKey = new RsaSecurityKey(privateRsa);
            SigningCredentials signingCredentials = new SigningCredentials(privateKey, SecurityAlgorithms.RsaSha256);

            var claims = new List<Claim>()
            {
                new Claim("nameidentifier", user.Id.ToString()),
                new Claim("email", user.Email),
            };
            foreach (var userRole in user.Roles)
            {
                claims.Add(new Claim("role", userRole));
            }

            var utcNow = DateTime.UtcNow;
            var jwtExpires = utcNow.AddMinutes(15);

            var jwt = new JwtSecurityToken(
                signingCredentials: signingCredentials,
                claims: claims,
                notBefore: utcNow,
                expires: jwtExpires);

            return new Jwt()
            {
                Token = new JwtSecurityTokenHandler().WriteToken(jwt),
                Expires = jwtExpires
            };
        }

        #endregion Helper Methods
    }
}
