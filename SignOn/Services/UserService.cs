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
    public interface IUserService
    {
        AuthenticatedUser Register(string firstName, string lastName, string email, string phoneNumber, string password);
        AuthenticatedUser Authenticate(string username, string password);
        RefreshedJwt Refresh(Guid refreshToken);
        void LogOut(long userId);
        IEnumerable<User> GetAll();
    }

    public class UserService : IUserService
    {
        private readonly ILogger<UserService> _logger;
        private readonly JwtKeys _jwtKeys;
        private static readonly List<User> users = new List<User>();

        public UserService(ILogger<UserService> logger, IOptions<JwtKeys> appSettings)
        {
            _logger = logger;
            _jwtKeys = appSettings.Value;
        }

        public AuthenticatedUser Register(string firstName, string lastName, string email, string phoneNumber, string password)
        {
            var user = users.Where(user => user.Email == email).FirstOrDefault();

            if (user == null)
            {
                var newUser = new User()
                {
                    Id = (users.LastOrDefault() ?? new User()).Id + 1,
                    FirstName = firstName,
                    LastName = lastName,
                    Email = email,
                    PhoneNumber = phoneNumber,
                    Password = password,
                    Roles = new string[] { UserRoles.ROLE_RESTAURANT_OWNER },
                    RefreshToken = Guid.NewGuid()
                };

                users.Add(newUser);

                return new AuthenticatedUser()
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

        public AuthenticatedUser Authenticate(string email, string password)
        {
            var user = users.SingleOrDefault(x => x.Email == email && x.Password == password);

            if (user == null)
            {
                return null;
            }
            else
            {
                user.RefreshToken = Guid.NewGuid();
                return new AuthenticatedUser()
                {
                    Jwt = CreateJwt(user),
                    JwtRefreshToken = user.RefreshToken
                };
            }
        }

        public RefreshedJwt Refresh(Guid refreshToken)
        {
            var user = users.SingleOrDefault(user => user.RefreshToken == refreshToken);
            if (user != null)
            {
                user.RefreshToken = Guid.NewGuid();
                return new RefreshedJwt()
                {
                    Jwt = CreateJwt(user),
                    RefreshToken = user.RefreshToken
                };
            }
            else
            {
                return null;
            }
        }

        public void LogOut(long userId)
        {
            _logger.LogInformation($"Logging out user, ID: {userId}");
            var user = users.SingleOrDefault(user => user.Id == userId);
            if (user != null)
            {
                user.RefreshToken = Guid.NewGuid(); //create a new un-guessable token - null could be guessable
            }
            else
            {
                _logger.LogError($"Cannot log out user, ID not found: {userId}");
            }
        }

        public IEnumerable<User> GetAll()
        {
            return users;
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
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.GivenName, user.FirstName),
                new Claim(ClaimTypes.Surname, user.LastName),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.OtherPhone, user.PhoneNumber),
            };
            foreach (var userRole in user.Roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, userRole));
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
