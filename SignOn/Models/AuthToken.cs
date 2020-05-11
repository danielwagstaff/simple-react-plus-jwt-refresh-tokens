
using System;

namespace SignOn.Models
{
    public class AuthToken
    {
        public Jwt Jwt { get; set; }
        public Guid JwtRefreshToken { get; set; }
    }
}
