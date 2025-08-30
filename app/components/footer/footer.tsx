
import { logo } from '@/lib/configs/config-file';
import PolicyContainer from '@/lib/utils/policy-container';

export default function Footer() {
	return (
		<>
			<footer className="w-full block z-50 flex justify-center bg-gray-800 text-white">
				<div className='w-full sm:max-w-[1200px] space-y-10 sm:space-y-0 sm:grid grid-cols-3 p-10 text-base-content'>
					<nav>
						<img
							className='h-[100px] aspect-square'
							src={logo} alt="" />
						<h6 className="font-bold text-white/60 mb-2 uppercase text-lg elegant">Company</h6>
						<div className="flex flex-col space-y-2">
							<span>Antonio&apos;s Resort</span>
							<span className="w-max">antonios.resort.book@gmail.com</span>
							<span className="w-max">+63927-633-8969</span>
							<span className="w-max">044-940-8972</span>
						</div>
					</nav>
					<nav>
						<h6 className="font-bold text-white/60 mb-2 uppercase text-lg elegant">Legal</h6>
						<div className="flex flex-col space-y-2">
							<PolicyContainer
								title="Terms and conditions"
								content="termscondition"
								asLink
							/>
							<PolicyContainer
								title="Privacy & Cookie policy"
								content="privacypolicy"
								asLink
							/>
							<PolicyContainer
								title="Reservation agreement"
								content="agreement"
								asLink
							/>
						</div>
						<br />
						<h6 className="font-bold text-white/60 uppercase mb-2 text-lg elegant">Socials</h6>
						<div className="flex flex-col space-y-2">
							<a target="_blank" href="https://www.facebook.com/antonios.resort.ne" className="hover:underline w-max">Facebook</a>
							<a target="_blank" href="https://www.instagram.com/antonios.resort.ne/" className="hover:underline w-max">Instagram</a>
						</div>
					</nav>
					<div>
						<iframe src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d3847.254755530121!2d121.0330413!3d15.3626833!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x339725305618f725%3A0xa4eec494aff18a3a!2sAntonio&#39;s%20Resort!5e0!3m2!1sen!2sph!4v1728400640490!5m2!1sen!2sph" className="w-full h-full" allowFullScreen={false} loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
					</div>
				</div>
			</footer>
			<footer className="flex items-center gap-4 justify-center px-10 border-t bg-gray-800 text-white">
				<img
					className='h-[120px] w-auto'
					src={logo} alt="" />
				<br />
				<p>&copy; 2024 Antonio&apos;s Resort | All Rights Reserved</p>
			</footer>
		</>
	)
}