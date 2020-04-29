using System;
using System.ComponentModel.DataAnnotations;

namespace SignOn.Entities
{
    public class User
    {
        [Key]
        public long Id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string PhoneNumber { get; set; }
        public string Password { get; set; }
        public string[] Roles { get; set; }
        public Guid RefreshToken { get; set; }
    }
}
