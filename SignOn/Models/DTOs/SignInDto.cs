
using System.ComponentModel.DataAnnotations;

namespace SignOn.Models.DTOs
{
    public class SignInDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        [StringLength(100)]
        public string Password { get; set; }
    }
}
