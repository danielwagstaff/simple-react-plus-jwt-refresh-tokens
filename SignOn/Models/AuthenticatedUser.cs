
using System;

namespace SignOn.Models
{
    public class AuthenticatedUser
    {
        public Jwt Jwt { get; set; }
        public Guid JwtRefreshToken { get; set; }
    }
}
