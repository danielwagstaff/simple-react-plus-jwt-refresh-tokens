using System;

namespace SignOn.Models
{
    public class Jwt
    {
        public string Token { get; set; }
        public DateTime Expires { get; set; }
    }
}
