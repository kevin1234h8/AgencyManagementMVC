using System;
using System.Web.Mvc;

namespace AgencyManagementMVC.Controllers
{
    public class FileRecordController : Controller
    {
        public ActionResult Index()
        {
            return RedirectToAction("FileRecord");
        }
        [Route("FileRecord")]
        public ActionResult FileRecord()
        {
            ViewBag.EnvirontmentName = Environment.MachineName;
            Console.WriteLine(Environment.MachineName);
            return View("FileRecord");
        }
    }
}