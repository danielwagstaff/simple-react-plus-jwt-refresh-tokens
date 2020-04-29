using System.ComponentModel.DataAnnotations;

namespace Restaurants.Models.DTOs
{
    public class AddRestaurantDto
    {
        [Required]
        [StringLength(255)]
        public string BusinessName { get; set; }

        [Required]
        [StringLength(255)]
        public string AddressLine1 { get; set; }

        [StringLength(255)]
        public string AddressLine2 { get; set; }

        [Required]
        [StringLength(35)]
        public string Town { get; set; }

        [StringLength(35)]
        public string County { get; set; }

        [Required]
        [StringLength(8)]
        public string PostCode { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        [Phone]
        public string Phone { get; set; }
    }
}
