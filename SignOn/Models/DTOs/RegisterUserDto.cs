
using System.ComponentModel.DataAnnotations;

namespace SignOn.Models.DTOs
{
    public class RegisterUserDto
    {
        [Required]
        [StringLength(100)]
        public string FirstName { get; set; }
        
        [Required]
        [StringLength(100)]
        public string LastName { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        [Phone]
        public string Phone { get; set; }

        [Required]
        [StringLength(100)]
        public string Password { get; set; }
    }
}
