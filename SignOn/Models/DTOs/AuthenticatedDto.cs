
using System;

namespace SignOn.Models.DTOs
{
    public class AuthenticatedDto
    {
        public string Jwt { get; set; }
        public DateTime JwtExpiry { get; set; }
    }
}
