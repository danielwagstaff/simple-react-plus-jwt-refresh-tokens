using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Restaurants.Entities;
using Restaurants.Models.DTOs;
using Restaurants.Services;
using System.Linq;

namespace Restaurants.Controllers
{
    [ApiController]
    [Route("[controller]")]
    [EnableCors("_corsSpecificOrigins")]
    public class RestaurantController : ControllerBase
    {
        private readonly ILogger<RestaurantController> _logger;
        private readonly IRestaurantService _restaurantService;
        private static readonly int INTERNAL_SERVER_ERROR = 500;

        public RestaurantController(ILogger<RestaurantController> logger, IRestaurantService restaurantService)
        {
            _logger = logger;
            _restaurantService = restaurantService;
        }

        [HttpPost]
        [Authorize(Roles = "RestaurantOwner")]
        public IActionResult Add([FromBody]AddRestaurantDto restaurantDto)
        {
            var userId = GetUserId();
            if (userId.HasValue)
            {
                try
                {
                    var restaurant = new Restaurant()
                    {
                        OwnerId = userId.Value,
                        BusinessName = restaurantDto.BusinessName,
                        AddressLine1 = restaurantDto.AddressLine1,
                        AddressLine2 = restaurantDto.AddressLine2,
                        Town = restaurantDto.Town,
                        County = restaurantDto.County,
                        PostCode = restaurantDto.PostCode.Replace(" ", string.Empty).ToUpper(),
                        Email = restaurantDto.Email,
                        Phone = restaurantDto.Phone.Replace(" ", string.Empty),
                        NumberOfAvailableServings = 0
                    };
                    var addedRestaurant = _restaurantService.Add(restaurant);
                    return Ok(addedRestaurant);
                }
                catch (RestaurantAlreadyExistsException)
                {
                    return Conflict();
                }
                catch (OwnerAlreadyHasRestaurantException)
                {
                    return StatusCode(423);
                }
            }
            else
            {
                return Unauthorized();
            }
        }

        [HttpPost]
        [Route("{restaurantId}/servings/{numberAvailable}")]
        [Authorize(Roles = "RestaurantOwner")]
        public IActionResult UpdateNumberOfServings(long restaurantId, int numberAvailable)
        {
            var userId = GetUserId();
            if (userId.HasValue)
            {
                try
                {
                    _restaurantService.UpdateNumberOfServings(userId.Value, restaurantId, numberAvailable);
                    return Ok();
                }
                catch (RestaurantNotOwnedByRequestorException)
                {
                    return Forbid();
                }
                catch (RestaurantDoesNotExistException)
                {
                    return NotFound();
                }
                catch (RestaurantIdDuplicatedException)
                {
                    return StatusCode(INTERNAL_SERVER_ERROR);
                }
            }
            else
            {
                return Unauthorized();
            }
        }

        [HttpPost]
        [Route("{restaurantId}/validate")]
        [Authorize(Roles = "Admin")]
        public IActionResult Verify(long restaurantId)
        {
            try
            {
                _restaurantService.Verify(restaurantId);
                return Ok();
            }
            catch (RestaurantDoesNotExistException)
            {
                return NotFound();
            }
            catch (RestaurantIdDuplicatedException)
            {
                return StatusCode(INTERNAL_SERVER_ERROR);
            }
        }

        [HttpDelete]
        [Route("{restaurantId}")]
        [Authorize(Roles = "RestaurantOwner")]
        public IActionResult Remove(long restaurantId)
        {
            var userId = GetUserId();
            if (userId.HasValue)
            {
                try
                {
                    var isRemoved = _restaurantService.Remove(userId.Value, restaurantId);
                    if (isRemoved)
                    {
                        return Ok();
                    }
                    else
                    {
                        return StatusCode(INTERNAL_SERVER_ERROR);
                    }
                }
                catch (RestaurantNotOwnedByRequestorException)
                {
                    return Forbid();
                }
                catch (RestaurantDoesNotExistException)
                {
                    return NotFound();
                }
                catch (RestaurantIdDuplicatedException)
                {
                    return StatusCode(INTERNAL_SERVER_ERROR);
                }
            }
            else
            {
                return Unauthorized();
            }
        }

        [AllowAnonymous]
        [HttpGet]
        public IActionResult Get(long? ownerId = null)
        {
            return Ok(_restaurantService.Search(ownerId));
        }

        #region Helper Methods

        public long? GetUserId()
        {
            var principal = HttpContext.User;
            var userId = principal?.Claims?.FirstOrDefault(claim => claim.Type == "nameidentifier")?.Value;
            if (userId != null)
            {
                return long.Parse(userId);
            }
            else
            {
                return null;
            }
        }

        #endregion
    }
}
