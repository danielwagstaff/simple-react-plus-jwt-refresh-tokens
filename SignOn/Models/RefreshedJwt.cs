using System;

namespace SignOn.Models
{
    public class RefreshedJwt
    {
        public Guid RefreshToken { get; set; }
        public Jwt Jwt { get; set; }
    }
}
