
using System;

namespace SignOn.Models.DTOs
{
    public class AuthenticatedUserDto
    {
        public long Id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string Jwt { get; set; }
        public DateTime JwtExpiry { get; set; }
    }
}
